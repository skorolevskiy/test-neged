import { SITE_URL, NEYNAR_API_KEY } from '@/config';
import { NextRequest, NextResponse } from 'next/server';
import { updatePointsSpins, updatePoints, updateDate, getUser } from '../../types';

// const HAS_KV = !!process.env.KV_URL;
// const transport = http(process.env.RPC_URL);

export const dynamic = 'force-dynamic';
let spins: number, date: string, points: number;

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

		const randomNumber = getRandomNumber();

		if (spins > 0) {
			switch (randomNumber) {
				case 1:
					await updatePointsSpins(fid, 100);
					spins--;
					console.warn('+100');
					return getResponse(ResponseType.IMAGE_100);
				case 2:
					await updatePointsSpins(fid, 250);
					spins--;
					console.warn('+250');
					return getResponse(ResponseType.IMAGE_250);
				case 3:
					await updatePointsSpins(fid, 500);
					spins--;
					console.warn('+500');
					return getResponse(ResponseType.IMAGE_1000);
				case 4:
					await updatePointsSpins(fid, 1000);
					spins--;
					console.warn('+1000');
					return getResponse(ResponseType.IMAGE_3000);
				case 5:
					await updatePointsSpins(fid, 3000);
					spins--;
					console.warn('+3000');
					return getResponse(ResponseType.IMAGE_5000);
				case 6:
					await updatePointsSpins(fid, 5000);
					spins--;
					console.warn('+5000');
					return getResponse(ResponseType.IMAGE_5000);
				case 7:
					await updatePointsSpins(fid, 10000);
					spins--;
					console.warn('+10000');
					return getResponse(ResponseType.IMAGE_10000);
			}
		} else {
			return getResponse(ResponseType.SPIN_OUT);
			
		}

		return getResponse(ResponseType.SPIN_OUT);
		// Check if user has minted before
		// if (HAS_KV) {
		//   const prevMintHash = await kv.get<Hex>(`mint:${address}`);

		//   if (prevMintHash) {
		//     return getResponse(ResponseType.ALREADY_MINTED);
		//   }
		// }

	} catch (error) {
		console.error(error);
		return getResponse(ResponseType.ERROR);
	}
}

enum ResponseType {
	SUCCESS,
	IMAGE_100,
	IMAGE_250,
	IMAGE_500,
	IMAGE_1000,
	IMAGE_3000,
	IMAGE_5000,
	IMAGE_10000,
	ERROR,
	SPIN_OUT
}

function getResponse(type: ResponseType) {
	const IMAGE = {
		[ResponseType.SUCCESS]: 'status/success.png',
		[ResponseType.IMAGE_100]: 'status/100.png',
		[ResponseType.IMAGE_250]: 'status/250.png',
		[ResponseType.IMAGE_500]: 'status/500.png',
		[ResponseType.IMAGE_1000]: 'status/1000.png',
		[ResponseType.IMAGE_3000]: 'status/3000.png',
		[ResponseType.IMAGE_5000]: 'status/5000.png',
		[ResponseType.IMAGE_10000]: 'status/10000.png',
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
		<meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/spin/" />
		`
		: 
		`
    	<meta name="fc:frame:button:1" content="🔄Try more" />
		<meta name="fc:frame:button:1:action" content="post" />
		<meta name="fc:frame:button:1:target" content="${SITE_URL}/api/frame/spin/" />

		<meta name="fc:frame:button:2" content="Leaderboard" />
		<meta name="fc:frame:button:2:action" content="post" />
		<meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/leaderboard/" />

		<meta name="fc:frame:button:3" content="Get more Hats" />
    	<meta name="fc:frame:button:3:action" content="link" />
    	<meta name="fc:frame:button:3:target" content="https://warpcast.com/~/compose?text=%F0%9F%8C%80%20Cast%20and%20get%203%20free%20spins%20to%20earn%20points.%20Points%20will%20be%20exchanged%20for%20tokens%20at%20the%20end%20of%20the%201st%20season.%20%0A%0A%F0%9F%AB%82%20Get%203%20more%20spins%20for%20each%20friend%20you%20invite.%20Read%20the%20%C2%ABRules%C2%BB%0Asection%20to%20learn%20more.%0A%0A%E2%98%80%EF%B8%8F%20Enter%20Onchain%20Summer%20with%20%2Fpill&embeds[]=${SITE_URL}/" />
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

function getRandomNumber(): number {
    const weights = [15, 30, 25, 10, 10, 5, 5];
    const cumulativeWeights: any = [];

    // Заполняем массив кумулятивных весов
    weights.reduce((acc, weight, index) => {
        cumulativeWeights[index] = acc + weight;
        return cumulativeWeights[index];
    }, 0);

    const random = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];

    // Определяем в какой диапазон попадает случайное число
    for (let i = 0; i < cumulativeWeights.length; i++) {
        if (random < cumulativeWeights[i]) {
            return i + 1;
        }
    }

    return 1; // На случай если что-то пойдет не так, возвращаем 1
}