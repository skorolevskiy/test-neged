import { SITE_URL, NEYNAR_API_KEY } from '@/config';
import { NextRequest, NextResponse } from 'next/server';
import { updatePointsSpins, updatePoints, updateDate, getUser } from '../types';

// const HAS_KV = !!process.env.KV_URL;
// const transport = http(process.env.RPC_URL);

export const dynamic = 'force-dynamic';
let spins: number, date: string, points: number, buttonText: string;

export async function POST(req: NextRequest): Promise<Response> {
	try {
		const body: { trustedData?: { messageBytes?: string } } = await req.json();

		// Check if frame request is valid
		const status = await validateFrameRequest(body.trustedData?.messageBytes);

		if (!status?.valid) {
			console.error(status);
			throw new Error('Invalid frame request');
		}

		const fid = status?.action?.interactor?.fid ? JSON.stringify(status.action.interactor.fid) : null;

		const User = await getUser(fid);

		if (!User) {
			spins = 0;
		} else {
			spins = User.dailySpins;
			points = User.points;
		}

		if (spins > 0) {}
		else {
			return getResponse(ResponseType.SPIN_OUT);
		}

		return getResponse(ResponseType.CHOICE);

	} catch (error) {
		console.error(error);
		return getResponse(ResponseType.ERROR);
	}
}

enum ResponseType {
	CHOICE,
	ERROR,
	SPIN_OUT
}

function getResponse(type: ResponseType) {
	const IMAGE = {
		[ResponseType.CHOICE]: 'status/choice.png',
		[ResponseType.ERROR]: 'status/error.png',
		[ResponseType.SPIN_OUT]: 'status/spin-out.png'
	}[type];
	const shouldRetry =
	  type === ResponseType.SPIN_OUT;
	// const successRetry = 
	//   type === ResponseType.SUCCESS;
	return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${SITE_URL}/${IMAGE}" />
    <meta property="fc:frame:image:aspect_ratio" content="1:1" />
    <meta property="fc:frame:post_url" content="${SITE_URL}/api/frame" />

	${shouldRetry
		? `
		<meta name="fc:frame:button:1" content="Get more Hats" />
    	<meta name="fc:frame:button:1:action" content="link" />
    	<meta name="fc:frame:button:1:target" content="https://warpcast.com/~/compose?text=%F0%9F%8C%80%20Cast%20and%20get%203%20free%20spins%20to%20earn%20points.%20Points%20will%20be%20exchanged%20for%20tokens%20at%20the%20end%20of%20the%201st%20season.%20%0A%0A%F0%9F%AB%82%20Get%203%20more%20spins%20for%20each%20friend%20you%20invite.%20Read%20the%20%C2%ABRules%C2%BB%0Asection%20to%20learn%20more.%0A%0A%E2%98%80%EF%B8%8F%20Enter%20Onchain%20Summer%20with%20%2Fpill&embeds[]=${SITE_URL}/" />

		<meta name="fc:frame:button:2" content="↩️Back" />
		<meta name="fc:frame:button:2:action" content="post" />
		<meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/" />
		`
		: 
		`
    	<meta name="fc:frame:button:1" content="🎩Left🎩" />
		<meta name="fc:frame:button:1:action" content="post" />
		<meta name="fc:frame:button:1:target" content="${SITE_URL}/api/frame/spin/left" />

		<meta name="fc:frame:button:2" content="🎩Middle🎩" />
		<meta name="fc:frame:button:2:action" content="post" />
		<meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/spin/middle" />

		<meta name="fc:frame:button:3" content="🎩Right🎩" />
		<meta name="fc:frame:button:3:action" content="post" />
		<meta name="fc:frame:button:3:target" content="${SITE_URL}/api/frame/spin/right" />

		<meta name="fc:frame:button:4" content="↩️Back" />
		<meta name="fc:frame:button:4:action" content="post" />
		<meta name="fc:frame:button:4:target" content="${SITE_URL}/api/frame/" />
		`
	}

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

function weighted_random_number() {
	const weights = [5, 4, 4, 4, 3, 2, 2, 1];

	const total_weight = weights.reduce((acc, val) => acc + val, 0);
	const random_weight = Math.floor(Math.random() * total_weight);
	let cumulative_weight = 0;
	for (let i = 0; i < weights.length; i++) {
		cumulative_weight += weights[i];
		if (random_weight < cumulative_weight) {
			return i + 1;
		}
	}
}