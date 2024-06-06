import { SITE_URL, NEYNAR_API_KEY } from '@/config';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<Response> {
	try {
		const body: { trustedData?: { messageBytes?: string } } = await req.json();

		// Check if frame request is valid
		const status = await validateFrameRequest(body.trustedData?.messageBytes);

		if (!status?.valid) {
			console.error(status);
			throw new Error('Invalid frame request');
		}

		return getResponse(ResponseType.SUCCESS);
	} catch (error) {
		console.error(error);
		return getResponse(ResponseType.ERROR);
	}
}

enum ResponseType {
	SUCCESS,
	NO_ADDRESS,
	ERROR,
}

function getResponse(type: ResponseType) {
	const IMAGE = {
		[ResponseType.SUCCESS]: 'https://gateway.lighthouse.storage/ipfs/QmNY7ESQtnHdFre4NAxH869MWL536mng8yhtMvRomsikfa/GREERING%20RAZ%201.png',
		[ResponseType.NO_ADDRESS]: 'https://gateway.lighthouse.storage/ipfs/QmNY7ESQtnHdFre4NAxH869MWL536mng8yhtMvRomsikfa/CONNECT.png',
		[ResponseType.ERROR]: 'https://gateway.lighthouse.storage/ipfs/QmNY7ESQtnHdFre4NAxH869MWL536mng8yhtMvRomsikfa/ERROR.png',
	}[type];
	// const shouldRetry =
	//   type === ResponseType.ERROR || type === ResponseType.RECAST;
	// const successRetry = 
	//   type === ResponseType.SUCCESS;
	const textForRef = 'I%27m%20in%20the%20negeD%20Magic%20Hat%20Game%21%20%F0%9F%94%84%F0%9F%8E%A9%F0%9F%AA%84%0A%0A%F0%9F%8E%81%20Over%205%2C000%20prize%20spots%20up%20for%20grabs%20%0A%0AJoin%20the%20fun%20with%20%40neged';

	return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="https://gateway.lighthouse.storage/ipfs/QmdeWzw29GkxC4HB4mJ963uX5iWkHXbWvJmbJ5cYNVGcTU" />
    <meta property="fc:frame:image:aspect_ratio" content="1:1" />
    <meta property="fc:frame:post_url" content="${SITE_URL}/api/frame" />

    <meta name="fc:frame:button:1" content="🔁Referral" />
    <meta name="fc:frame:button:1:action" content="link" />
    <meta name="fc:frame:button:1:target" content="https://warpcast.com/~/compose?text=${textForRef}&embeds[]=${SITE_URL}/" />

	<meta name="fc:frame:button:2" content="🏆Prizes" />
    <meta name="fc:frame:button:2:action" content="post" />
    <meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/prizes/" />

	<meta name="fc:frame:button:3" content="↩️Back" />
    <meta name="fc:frame:button:3:action" content="post" />
    <meta name="fc:frame:button:3:target" content="${SITE_URL}/api/frame/" />

  </head></html>`);
}

async function validateFrameRequest(data: string | undefined) {
	if (!NEYNAR_API_KEY) throw new Error('NEYNAR_API_KEY is not set');
	if (!data) throw new Error('No data provided');

	const options = {
		method: 'POST',
		headers: {
			accept: 'application/json',
			api_key: NEYNAR_API_KEY,
			'content-type': 'application/json',
		},
		body: JSON.stringify({ message_bytes_in_hex: data }),
	};

	return await fetch(
		'https://api.neynar.com/v2/farcaster/frame/validate',
		options,
	)
		.then((response) => response.json())
		.catch((err) => console.error(err));
}
