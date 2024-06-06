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
		[ResponseType.SUCCESS]: 'https://gateway.lighthouse.storage/ipfs/QmNY7ESQtnHdFre4NAxH869MWL536mng8yhtMvRomsikfa/GREERING%20RAZ%201.png',
		[ResponseType.IMAGE_100]: 'https://gateway.lighthouse.storage/ipfs/QmaB9wghmcaqgT9tJYvc3jigrse3fYao68DyeVcuuTxJ8J/L100.gif',
		[ResponseType.IMAGE_250]: 'https://gateway.lighthouse.storage/ipfs/QmaB9wghmcaqgT9tJYvc3jigrse3fYao68DyeVcuuTxJ8J/L200.gif',
		[ResponseType.IMAGE_500]: 'https://gateway.lighthouse.storage/ipfs/QmaB9wghmcaqgT9tJYvc3jigrse3fYao68DyeVcuuTxJ8J/L500.gif',
		[ResponseType.IMAGE_1000]: 'https://gateway.lighthouse.storage/ipfs/QmaB9wghmcaqgT9tJYvc3jigrse3fYao68DyeVcuuTxJ8J/L1000.gif',
		[ResponseType.IMAGE_3000]: 'https://gateway.lighthouse.storage/ipfs/QmaB9wghmcaqgT9tJYvc3jigrse3fYao68DyeVcuuTxJ8J/L3000.gif',
		[ResponseType.IMAGE_5000]: 'https://gateway.lighthouse.storage/ipfs/QmaB9wghmcaqgT9tJYvc3jigrse3fYao68DyeVcuuTxJ8J/L5000.gif',
		[ResponseType.IMAGE_10000]: 'https://gateway.lighthouse.storage/ipfs/QmaB9wghmcaqgT9tJYvc3jigrse3fYao68DyeVcuuTxJ8J/L10000.gif',
		[ResponseType.ERROR]: 'https://gateway.lighthouse.storage/ipfs/QmNY7ESQtnHdFre4NAxH869MWL536mng8yhtMvRomsikfa/ERROR.png',
		[ResponseType.SPIN_OUT]: 'https://gateway.lighthouse.storage/ipfs/QmNY7ESQtnHdFre4NAxH869MWL536mng8yhtMvRomsikfa/ENLIS.png'
	}[type];
	const shouldRetry =
	  type === ResponseType.SPIN_OUT;
	// const successRetry = 
	//   type === ResponseType.SUCCESS;
	return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${IMAGE}" />
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
    // Определяем интервалы вероятностей
    const intervals = [
        { number: 1, probability: 15 },
        { number: 2, probability: 25 },
        { number: 3, probability: 25 },
        { number: 4, probability: 15 },
        { number: 5, probability: 10 },
        { number: 6, probability: 5 },
        { number: 7, probability: 5 },
    ];

    // Вычисляем суммарную вероятность
    const totalProbability = intervals.reduce((sum, interval) => sum + interval.probability, 0);

    // Генерируем случайное число от 0 до totalProbability
    const random = Math.random() * totalProbability;

    // Определяем в какой интервал попадает случайное число
    let accumulatedProbability = 0;
    for (const interval of intervals) {
        accumulatedProbability += interval.probability;
        if (random < accumulatedProbability) {
            return interval.number;
        }
    }

    // На случай если что-то пойдет не так, возвращаем последнее число
    return intervals[intervals.length - 1].number;
}