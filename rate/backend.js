/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

let normalHeader = {
    status: 200,
    statusText: 'OK',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE'
    }
};

let notFoundHeader = {
    status: 404,
    statusText: 'Not Found',
    headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE'
    }
};

let NotAvailableHeader = {
    status: 405,
    statusText: 'Not Found',
    headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE'
    }
};


let alreadyInuse = {
    status: 409,
    statusText: 'Not Found',
    headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE'
    }
};

export default {
    async fetch(request, env) {
        const corsHeaders = {
          'Access-Control-Allow-Origin': '*', // Or specify your origin
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        };
    
        if (request.method === 'OPTIONS') {
            // Handle CORS preflight request
            return new Response(null, {
              status: 204,
              headers: corsHeaders,
            });
        }

        normalHeader.headers["Access-Control-Allow-Origin"] = request.headers.get('Origin');
        NotAvailableHeader.headers["Access-Control-Allow-Origin"] = request.headers.get('Origin');
        notFoundHeader.headers["Access-Control-Allow-Origin"] = request.headers.get('Origin');
        alreadyInuse.headers["Access-Control-Allow-Origin"] = request.headers.get('Origin');
        const url = new URL(request.url);
        const path = url.pathname;

        kvNamespace = env.annotation_new;

        if (path === "/upload") {
            response = await handleUpload(request);
        } else if (path === "/getCompleted") {
            response = await handleGetCompleted(request);
        } else if (path === "/get") {
            response = await handleGetComment(request);
        } else if (path === "/put") {
            response = await handlePutComment(request);
        } else {
            response = new Response("Not Found", { status: 404 });
        }
      
    }
}

var getTime = function () {
    return new Date().getTime();
};


async function handlePutComment(request) {
    // only allow post
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", NotAvailableHeader);
    }
    const { key, rater, value } = await request.json();
    

    // Store applicant data in KV storage
    await kvNamespace.put(key, JSON.stringify({
      "time": getTime(),
      "rater": rater,
      "value": value
    }));
    

    return new Response(JSON.stringify({ msg: 'Annotation uploaded successfully for screenshot', key }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': request.headers.get('Origin'),
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
      
}

async function handleGetComment(request) {
    // only allow post
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", NotAvailableHeader);
    }
    const { key } = await request.json();
    
    const value = await kvNamespace.get(key);

    if(value == null) {
        console.log("No value found in KV for the given image index");
        return new Response(JSON.stringify(value), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': request.headers.get('Origin'),
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            }
          });
          
    } else{
        console.log("Value found in KV for the given image index");
        return new Response(JSON.stringify(value), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': request.headers.get('Origin'),
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            }
          });
          
    }
}


async function handleUpload(request) {
    // only allow post
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", NotAvailableHeader);
    }
    const { key, index, rater } = await request.json();
    

    // Store applicant data in KV storage
    await kvNamespace.put(rater+":"+key, JSON.stringify({
      "time": getTime(),
      "index": index,
      "rater": rater
    }));
    
    return new Response(JSON.stringify({ msg: 'Annotation progress saved for element', index }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': request.headers.get('Origin'),
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
}

async function handleGet(request) {
    // only allow post
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", NotAvailableHeader);
    }
    const { key } = await request.json();
    
    const value = await kvNamespace.list({ prefix: key+":" });

    return new Response(JSON.stringify(value.keys), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': request.headers.get('Origin'),
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
      
}
