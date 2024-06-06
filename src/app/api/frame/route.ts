import { abi } from '@/abi/ERC20';
import { SITE_URL, NEYNAR_API_KEY, CHAIN, CONTRACT_ADDRESS } from '@/config';
//import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import {
	Address,
	Hex,
	TransactionExecutionError,
	createPublicClient,
	http,
	formatUnits
} from 'viem';

let fid: string, points: number, spins: number, dateString: string, refFid: string, refCount: number;
import { addUser, getUser, updateDate, updateRefSpins, updateRefCount } from './types'
//const HAS_KV = !!process.env.KV_URL;
const transport = http(process.env.RPC_URL);

const publicClient = createPublicClient({
	chain: CHAIN,
	transport,
  });

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

		// Check if user has an address connected
		// Check if user has an address connected
		const address: Address | undefined =
			status?.action?.interactor?.verifications?.[0];

		if (!address) {
			return getResponse(ResponseType.NO_ADDRESS);
		}

		const fid_new = status?.action?.interactor?.fid ? JSON.stringify(status.action.interactor.fid) : null;
		const username_new = status?.action?.interactor?.username ? JSON.stringify(status.action.interactor.username) : null;
		const refFid_new = status?.action?.cast?.author?.fid ? JSON.stringify(status?.action?.cast?.author?.fid) : '18850';
		const wallet = status?.action?.interactor?.verifications?.[0] ? status.action.interactor.verifications?.[0] : null;

		const User = await getUser(fid_new);

		if (!User) {
			await addUser(fid_new, username_new, wallet, refFid_new);
			spins = 2;

			const UserRef = await getUser(refFid_new);
			let refCount = UserRef.refCount;
			if (refCount < 10) {
				await updateRefSpins(refFid_new);
			} else {
				await updateRefCount(refFid_new);
			}
		} else {

			refFid = User.refFid;
			spins = User.dailySpins;
			dateString = User.lastSpin;
			refCount = User.refCount;
			
		}

		const today: string = new Date().toLocaleString().split(',')[0];
		const lastSpin: string = new Date(dateString).toLocaleString().split(',')[0];

		if (lastSpin !== today) {
			await updateDate(fid_new, refCount);
			let spinsCount = 2;
			if (refCount > 10) {
				spinsCount = spinsCount + 10;
			}
			else {
				spinsCount = spinsCount + refCount;
			}
			spins = spinsCount;
		}

		// Check if user has liked and recasted
		const hasLikedAndRecasted =
			!!status?.action?.cast?.viewer_context?.liked &&
			!!status?.action?.cast?.viewer_context?.recasted;

		if (!hasLikedAndRecasted) {
			return getResponse(ResponseType.RECAST);
		}

		return getResponse(ResponseType.SUCCESS);
	} catch (error) {
		console.error(error);
		return getResponse(ResponseType.ERROR);
	}
}

enum ResponseType {
	SUCCESS,
	RECAST,
	NO_ADDRESS,
	ERROR
}

function getResponse(type: ResponseType) {
	const IMAGE = {
		[ResponseType.SUCCESS]: 'https://gateway.lighthouse.storage/ipfs/QmYy8TSLfACCpoUcxCvwN49n6h5MCmcfFDjZCRMVgT89QK',
		[ResponseType.RECAST]: 'https://gateway.lighthouse.storage/ipfs/QmXT5a2MFGrNudfnyfaEEWRRRuYc5ZysGY8MBBj6FZeZPN',
		[ResponseType.NO_ADDRESS]: 'https://gateway.lighthouse.storage/ipfs/QmNY7ESQtnHdFre4NAxH869MWL536mng8yhtMvRomsikfa/CONNECT.png',
		[ResponseType.ERROR]: 'https://gateway.lighthouse.storage/ipfs/QmNY7ESQtnHdFre4NAxH869MWL536mng8yhtMvRomsikfa/ERROR.png',
	}[type];
	const shouldRetry =
		type === ResponseType.ERROR || type === ResponseType.RECAST;
	// const successRetry = 
	//   type === ResponseType.SUCCESS;
	return new NextResponse(`<!DOCTYPE html><html><head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${IMAGE}" />
    <meta property="fc:frame:image:aspect_ratio" content="1:1" />
    <meta property="fc:frame:post_url" content="${SITE_URL}/api/frame" />

    ${shouldRetry
			? 
				`<meta property="fc:frame:button:1" content="Try again" />
				`
			: 
				`<meta name="fc:frame:button:1" content="${spins} Hats" />
				<meta name="fc:frame:button:1:action" content="post" />
				<meta name="fc:frame:button:1:target" content="${SITE_URL}/api/frame/spin/" />
			
				<meta name="fc:frame:button:2" content="Rules" />
				<meta name="fc:frame:button:2:action" content="post" />
				<meta name="fc:frame:button:2:target" content="${SITE_URL}/api/frame/rules/" />
			
				<meta name="fc:frame:button:3" content="Leaderboard" />
				<meta name="fc:frame:button:3:action" content="post" />
				<meta name="fc:frame:button:3:target" content="${SITE_URL}/api/frame/leaderboard/" />
			
				<meta name="fc:frame:button:4" content="Buy negeD" />
				<meta name="fc:frame:button:4:action" content="link" />
				<meta name="fc:frame:button:4:target" content="https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=0x4229c271c19ca5f319fb67b4bc8a40761a6d6299" />`
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
		body: JSON.stringify({
			cast_reaction_context: true,
			follow_context: true,
			signer_context: false,
			channel_follow_context: true,
			message_bytes_in_hex: data
		}),
	};

	return await fetch(
		'https://api.neynar.com/v2/farcaster/frame/validate',
		options,
	)
		.then((response) => response.json())
		.catch((err) => console.error(err));
}
