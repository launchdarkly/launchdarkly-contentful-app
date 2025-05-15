import { NextRequest, NextResponse } from 'next/server';

interface EnvironmentResponse {
  _id: string;
  key: string;
  name: string;
  // Add other environment properties as needed
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, action, params } = await req.json();
    if (!apiKey) {
      return NextResponse.json({ status: 400, body: { error: 'Missing API key' } }, { status: 400 });
    }

    const apiUrl = 'https://app.launchdarkly.com/api/v2';
    let res, body;

    switch (action) {
      case 'getFlags': {
        const { projectKey } = params;
        const url = `${apiUrl}/flags/${projectKey}?limit=100`;
        res = await fetch(url, {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        body = await res.json();
        break;
      }
      case 'getEnvironments': {
        const { projectKey } = params;
        let allItems: EnvironmentResponse[] = [];
        let offset = 0;
        const limit = 100;
        let totalCount = 0;
        try {
          // First, list all environments to get their keys
          do {
            const listUrl = `${apiUrl}/projects/${projectKey}/environments?limit=${limit}&offset=${offset}`;
            res = await fetch(listUrl, {
              headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            });
            
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`Failed to list environments: ${res.status} ${res.statusText} - ${errorText}`);
            }
            
            const page = await res.json();
            if (page.items) {
              // For each environment, fetch its full details
              const environmentDetails = await Promise.all(
                page.items.map(async (env: any) => {
                  const detailUrl = `${apiUrl}/projects/${projectKey}/environments/${env.key}`;
                  const detailRes = await fetch(detailUrl, {
                    headers: {
                      'Authorization': apiKey,
                      'Content-Type': 'application/json',
                      'Accept': 'application/json',
                    },
                  });
                  if (!detailRes.ok) {
                    return env; // Return the basic info if we can't get details
                  }
                  return await detailRes.json();
                })
              );
              allItems = allItems.concat(environmentDetails);
            }
            totalCount = page.totalCount || 0;
            offset += limit;
          } while (allItems.length < totalCount);
          body = { items: allItems, totalCount };
        } catch (error) {
          throw error;
        }
        break;
      }
      case 'getProjects': {
        const url = `${apiUrl}/projects?limit=100`;
        res = await fetch(url, {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch projects: ${res.status} ${res.statusText} - ${errorText}`);
        }
        
        body = await res.json();
        break;
      }
      case 'updateFlagVariations': {
        const { flagKey, projectKey, instructions } = params;
        if (!flagKey || !projectKey || !instructions) {
          return NextResponse.json({ status: 400, body: { error: 'Missing required parameters' } }, { status: 400 });
        }
        const url = `${apiUrl}/flags/${projectKey}/${flagKey}`;
        res = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json; domain-model=launchdarkly.semanticpatch',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ instructions }),
        });
        body = await res.json();
        break;
      }
      case 'getFlagDetails': {
        const { flagKey, projectKey } = params;
        if (!flagKey || !projectKey) {
          return NextResponse.json({ status: 400, body: { error: 'Missing flagKey or projectKey' } }, { status: 400 });
        }
        const url = `${apiUrl}/flags/${projectKey}/${flagKey}`;
        res = await fetch(url, {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        body = await res.json();
        console.log('[API] getFlagDetails response:', body);
        break;
      }
      // Add more actions as needed
      default:
        return NextResponse.json({ status: 400, body: { error: 'Unknown action' } }, { status: 400 });
    }

    if (!res.ok) {
      return NextResponse.json({ status: res.status, body }, { status: res.status });
    }
    return NextResponse.json({ status: res.status, body }, { status: res.status });
  } catch (error) {
    return NextResponse.json({ status: 500, body: { error: (error as Error).message } }, { status: 500 });
  }
} 