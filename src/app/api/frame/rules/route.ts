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
		[ResponseType.SUCCESS]: 'status/success.png',
		[ResponseType.NO_ADDRESS]: 'status/no-address.png',
		[ResponseType.ERROR]: 'status/error.png',
	}[type];
	// const shouldRetry =
	//   type === ResponseType.ERROR || type === ResponseType.RECAST;
	// const successRetry = 
	//   type === ResponseType.SUCCESS;
	return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${SITE_URL}/status/rules.jpg" />
    <meta property="fc:frame:image:aspect_ratio" content="1:1" />
    <meta property="fc:frame:post_url" content="${SITE_URL}/api/frame" />

    <meta name="fc:frame:button:1" content="🔁Referral" />
    <meta name="fc:frame:button:1:action" content="link" />
    <meta name="fc:frame:button:1:target" content="https://warpcast.com/~/compose?text=%F0%9F%8C%80%20Cast%20and%20get%203%20free%20spins%20to%20earn%20points.%20Points%20will%20be%20exchanged%20for%20tokens%20at%20the%20end%20of%20the%201st%20season.%20%0A%0A%F0%9F%AB%82%20Get%203%20more%20spins%20for%20each%20friend%20you%20invite.%20Read%20the%20%C2%ABRules%C2%BB%0Asection%20to%20learn%20more.%0A%0A%E2%98%80%EF%B8%8F%20Enter%20Onchain%20Summer%20with%20%2Fpill&embeds[]=${SITE_URL}/" />

	<meta name="fc:frame:button:2" content="↩️Back" />
    <meta name="fc:frame:button:2:action" content="post" />
    <meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/" />

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
