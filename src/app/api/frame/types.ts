import * as kysely from 'kysely'
import { createKysely } from '@vercel/postgres-kysely'
import { sql } from '@vercel/postgres'

export interface PlayersTable {
	id: kysely.Generated<number>
	fid: string | null
	username: string | null
	wallet: string | null
	points: number
	dailySpins: number
	lastSpin: kysely.ColumnType<Date, string | undefined, never>
	createdAt: kysely.ColumnType<Date, string | undefined, never>
	refFid: string | null
	refCount: number
	refSpins: number
}

// Keys of this interface are table names.
export interface Database {
	players: PlayersTable
}

export const db = createKysely<Database>()
export { sql } from 'kysely'

export async function getUser(fid: string | null): Promise<any> {
	let data: any;

	try {
		data = await db
			.selectFrom('players')
			.where('fid', '=', fid)
			.selectAll()
			.executeTakeFirst();
		return data; // Data fetched successfully
	} catch (e: any) {
		if (e.message.includes('relation "players" does not exist')) {
			console.warn(
				'Table does not exist, creating and seeding it with dummy data now...'
			);
			// Table is not created yet
			//await seed();
			return false; // Data fetched successfully after seeding
		} else {
			console.error('Error fetching data:', e);
			return false; // Error occurred while fetching data
		}
	}
}

export async function addUser(fid: string | null, username: string | null, wallet: string | null, ref_fid: string | null) {

	const result = await db
		.insertInto('players')
		.values({
			fid: fid ? fid : null,
			username: username ? username : null,
			wallet: wallet ? wallet : null,
			points: 0,
			dailySpins: 2,
			lastSpin: new Date().toLocaleString(),
			refFid: ref_fid,
			refSpins: 0,
			refCount: 0,
		})
		.executeTakeFirst()
}

export async function updatePointsSpins(fid: string | null, points: number) {
	await db
		.updateTable('players')
		.set((eb) => ({
			points: eb('points', '+', points),
			dailySpins: eb('dailySpins', '-', 1)
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function updatePoints(fid: string | null, points: number) {
	await db
		.updateTable('players')
		.set((eb) => ({
			points: eb('points', '+', points),
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function updateDate(fid: string | null, refCount: number) {
	let spinsCount = 2;
	if (refCount > 10) {
		spinsCount = spinsCount + 10;
	}
	else {
		spinsCount = spinsCount + refCount;
	}
	await db
		.updateTable('players')
		.set((eb) => ({
			dailySpins: spinsCount,
			lastSpin: new Date().toLocaleString(),
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function updateRefSpins(fid: string | null) {
	await db
		.updateTable('players')
		.set((eb) => ({
			refCount: eb('refCount', '+', 1),
			dailySpins: eb('dailySpins', '+', 1),
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function updateRefCount(fid: string | null) {
	await db
		.updateTable('players')
		.set((eb) => ({
			refCount: eb('refCount', '+', 1),
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function getTopPlayers(): Promise<any> {
	let data: any;
	try {
		data = await db
			.selectFrom('players')
			.select(['fid', 'username', 'points', 'refCount'])
			.orderBy('points desc')
			.limit(10)
			.execute();
		return data;
	} catch (e: any) {
		console.error('Ошибка получения данных:', e.message);
		return false;
	}
}

export async function getUserPosition(fid: string | null) {
	let data: any;
	try {
		const userPoints = await db
			.selectFrom('players')
			.select('points')
			.where('fid', '=', fid)
			.executeTakeFirst();

		data = await db
			.selectFrom('players')
			.select(db.fn.countAll().as('count'))
			.where('points', '>', userPoints?.points ?? 0)
			.execute();
		return data[0]['count'];
	} catch (e: any) {
		console.error('Ошибка получения данных:', e.message);
		return false;
	}
}

export async function getAllUsers() {
	let data: any;
	data = await db
			.selectFrom('players')
			.selectAll()
			.orderBy('points desc')
			.execute();
	return data;
}