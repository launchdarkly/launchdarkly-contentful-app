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
        
        console.log('[API] getFlags called for project:', projectKey);
        console.log('[API] Final URL:', url);
        
        res = await fetch(url, {
          headers: {
            'Authorization': apiKey.startsWith('api-') ? apiKey : `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        console.log('[API] getFlags response status:', res.status);
        body = await res.json();
        console.log('[API] getFlags response items count:', body.items?.length || 0);
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
                'Authorization': apiKey.startsWith('api-') ? apiKey : `Bearer ${apiKey}`,
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
                      'Authorization': apiKey.startsWith('api-') ? apiKey : `Bearer ${apiKey}`,
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
        console.log('[API] getProjects called with API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
    console.log('[API] API key starts with api-:', apiKey?.startsWith('api-'));
    console.log('[API] Authorization header will be:', apiKey?.startsWith('api-') ? 'api-...' : 'Bearer api-...');
        let allItems: any[] = [];
        let offset = 0;
        const limit = 100;
        let totalCount = 0;
        try {
          do {
            const url = `${apiUrl}/projects?limit=${limit}&offset=${offset}`;
            console.log('[API] Fetching projects from:', url);
            res = await fetch(url, {
              headers: {
                'Authorization': apiKey.startsWith('api-') ? apiKey : `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            });
            
            console.log('[API] Projects response status:', res.status);
            if (!res.ok) {
              const errorText = await res.text();
              console.error('[API] Projects fetch error:', res.status, res.statusText, errorText);
              throw new Error(`Failed to fetch projects: ${res.status} ${res.statusText} - ${errorText}`);
            }
            
            const page = await res.json();
            console.log('[API] Projects page response:', JSON.stringify(page, null, 2));
            if (page.items) {
              allItems = allItems.concat(page.items);
            } else {
              console.log('[API] No items found in response, page structure:', Object.keys(page));
            }
            totalCount = page.totalCount || 0;
            offset += limit;
          } while (allItems.length < totalCount);
          body = { items: allItems, totalCount };
          console.log('[API] Total projects found:', allItems.length);
        } catch (error) {
          console.error('[API] getProjects error:', error);
          throw error;
        }
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
            'Authorization': apiKey.startsWith('api-') ? apiKey : `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        body = await res.json();
        console.log('[API] getFlagDetails response:', body);
        break;
      }
      case 'createFlag': {
        const { projectKey, flagData } = params;
        if (!projectKey || !flagData) {
          return NextResponse.json({ status: 400, body: { error: 'Missing projectKey or flagData' } }, { status: 400 });
        }
        
        // Validate required fields
        if (!flagData.name || !flagData.key || !flagData.kind || !flagData.variations) {
          return NextResponse.json({ 
            status: 400, 
            body: { error: 'Missing required flag fields: name, key, kind, variations' } 
          }, { status: 400 });
        }

        const url = `${apiUrl}/flags/${projectKey}`;
        res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': apiKey.startsWith('api-') ? apiKey : `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(flagData),
        });
        body = await res.json();
        console.log('[API] createFlag response:', body);
        break;
      }


      // Only safe, read-only + creation endpoints allowed
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