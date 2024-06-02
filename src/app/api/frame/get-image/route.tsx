import { SITE_URL } from '@/config';
import { ImageResponse } from 'next/og';
import { getTopPlayers, getUser, getUserPosition } from '../types';
// App router includes @vercel/og.
// No need to install it.

let fid: string, username: string, points: number, position: number, refCount: number;

interface Player {
	fid: string;
	username: string,
	points: number;
	refCount: number;
}

export async function GET(request: Request) {
	// const fontData = await fetch(
	// 	new URL(SITE_URL + '/assets/GeistMonoRegular.ttf', import.meta.url),
	//   ).then((res) => res.arrayBuffer());

	try {
		const { searchParams } = new URL(request.url);

		const hasFid = searchParams.has('fid');
		const fid = hasFid ? searchParams.get('fid') : null;

		const user = await getUser(fid);
		position = Number(await getUserPosition(fid));

		if (!user) {
			points = 0;
		} else {
			username = (user.username).replace(/"/g, '');
			points = user.points;
			refCount = user.refCount;
		}

		const topPlayers: Player[] = await getTopPlayers();

		const prizeArray = [
			{ prize: '1 000 000' },
			{ prize: '250 000' },
			{ prize: '100 000' },
			{ prize: '75 000' },
			{ prize: '50 000' },
			{ prize: '40 000' },
			{ prize: '30 000' },
			{ prize: '20 000' },
			{ prize: '10 000' },
			{ prize: '5 000' }
		  ];

		return new ImageResponse(
			(
				<div
					style={{
						fontFamily: 'Arial, Inter, "Material Icons"',
						fontSize: 40,
						color: 'black',
						background: '#1e293b',
						width: '100%',
						height: '100%',
						padding: '40px 50px',
						textAlign: 'center',
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center',
						flexDirection: 'column',
						flexWrap: 'nowrap',
					}}
				>
					<div
						style={{
							fontFamily: 'Arial, Inter, "Material Icons"',
							fontSize: 40,
							fontStyle: 'normal',
							fontWeight: 700,
							letterSpacing: '-0.025em',
							color: 'white',
							lineHeight: 1,
							whiteSpace: 'pre-wrap',
						}}
					>
						Leaderboard
					</div>

					<div tw="flex w-full text-3xl">
						<div tw="flex bg-white shadow-lg rounded-lg my-6">
							<table tw="w-full flex flex-col rounded-lg">
								<thead tw="flex">
									<tr tw="flex w-full bg-purple-100 text-gray-600 uppercase text-2xl leading-normal rounded-lg">
										<th tw="w-1/12 py-3 px-3 text-left">#</th>
										<th tw="w-1/8 py-3 px-3 text-left">Fid</th>
										<th tw="w-1/3 py-3 px-3 text-left">Nickname</th>
										<th tw="w-1/12 py-3 px-3 text-left">Ref.</th>
										<th tw="w-1/5 py-3 px-3 text-left">Prize</th>
										<th tw="flex-1 py-3 px-3 text-black text-center">Points</th>
									</tr>
								</thead>
								<tbody tw="flex w-full flex-col text-gray-600 text-2xl font-light">
									{topPlayers.map((player, index) => (
										<tr  key={index + 1} tw="flex w-full border-2 border-gray-200 bg-gray-50">
											<td tw="w-1/12 py-2 px-3 text-left">
												<span tw="font-medium">{index + 1}</span>
											</td>
											<td tw="w-1/8 py-2 px-3 text-left">
												<span tw="font-medium">{player.fid}</span>
											</td>
											<td tw="w-1/3 py-2 px-3 text-left">
												<span>@{(player.username).replace(/"/g, '')}</span>
											</td>
											<td tw="w-1/12 py-2 px-3 text-left">
												<span tw="font-medium">{player.refCount < 11 ? (`${player.refCount}`) : ('10+')}</span>
											</td>
											<td tw="w-1/5 py-2 px-3 text-left bg-purple-50">
												<span tw="font-medium">{prizeArray[index].prize}</span>
											</td>
											<td tw="flex-1 py-2 px-3 text-black font-bold">
												<span>{player.points}</span>
											</td>
										</tr>
									))}

									<tr tw="flex w-full border-2 border-red-600 rounded-lg">
										<td tw="w-1/12 py-2 px-3 text-left">
											<div tw="flex items-center">
												<span tw="font-medium">{position + 1}</span>
											</div>
										</td>
										<td tw="w-1/8 py-2 px-3 text-left">
											<div tw="flex items-center">
												<span tw="font-medium">{fid}</span>
											</div>
										</td>
										<td tw="w-1/3 py-2 px-3 text-left">
											<div tw="flex items-center">
												<span>@{username}</span>
											</div>
										</td>
										<td tw="w-1/12 py-2 px-3 text-left">
											<div tw="flex items-center">
												<span>{refCount < 11 ? (`${refCount}`) : ('10+')}</span>
											</div>
										</td>
										<td tw="w-1/5 py-2 px-3 text-left bg-purple-50">
											<div tw="flex items-center">
												{position + 1 >= 1 && position + 1 < 11 ? (
												`${prizeArray[position].prize}`
												) : ('?')}
											</div>
										</td>
										<td tw="flex-1 py-2 px-3 text-black font-bold">
											<span>{points}</span>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							width: '100%',
							fontFamily: 'Arial, Inter, "Material Icons"',
							fontSize: 20,
							fontStyle: 'normal',
							letterSpacing: '-0.025em',
							color: 'white',
							lineHeight: 1.4,
							whiteSpace: 'pre-wrap',
						}}
					>
						<p>Build by Neged, dev @eat</p>
						<img
							alt="pill"
							width="64"
							height="64"
							src={SITE_URL + '/status/logo.png'}
							/>
					</div>
				</div>
			),
			{
				width: 960,
				height: 960,
				// fonts: [
				// 	{
				// 	  name: 'Geist',
				// 	  data: fontData,
				// 	  style: 'normal',
				// 	},
				//   ],
			},
		);
	} catch (e: any) {
		console.log(`${e.message}`);
		return new Response(`Failed to generate the image`, {
			status: 500,
		});
	}
}