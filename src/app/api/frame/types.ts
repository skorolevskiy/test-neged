import * as kysely from 'kysely'
import { createKysely } from '@vercel/postgres-kysely'
import { sql } from '@vercel/postgres'

export interface PlayersTable {
	id: kysely.Generated<number>
	fid: string | null
	username: string | null
	name: string | null
	points: number
	dailySpins: number
	lastSpin: kysely.ColumnType<Date, string | undefined, never>
	createdAt: kysely.ColumnType<Date, string | undefined, never>
	refFid: string | null
}

// Keys of this interface are table names.
export interface Database {
	spiners: PlayersTable
}

export const db = createKysely<Database>()
export { sql } from 'kysely'

export async function getUser(fid: string | null): Promise<any> {
	let data: any;

	try {
		data = await db
			.selectFrom('spiners')
			.where('fid', '=', fid)
			.selectAll()
			.executeTakeFirst();
		return data; // Data fetched successfully
	} catch (e: any) {
		if (e.message.includes('relation "spiners" does not exist')) {
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

export async function addUser(fid: string | null, username: string | null, display_name: string | null, ref_fid: string | null, power_badge: boolean | null) {

	const result = await db
		.insertInto('spiners')
		.values({
			fid: fid ? fid : null,
			username: username ? username : null,
			name: display_name ? display_name : null,
			points: 0,
			dailySpins: power_badge ? 6 : 3,
			lastSpin: new Date().toLocaleString(),
			refFid: ref_fid
		})
		.executeTakeFirst()
}

export async function updatePointsSpins(fid: string | null, points: number) {
	await db
		.updateTable('spiners')
		.set((eb) => ({
			points: eb('points', '+', points),
			dailySpins: eb('dailySpins', '-', 1)
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function updatePoints(fid: string | null, points: number) {
	await db
		.updateTable('spiners')
		.set((eb) => ({
			points: eb('points', '+', points),
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function updateDate(fid: string | null, power_badge: boolean | null) {
	await db
		.updateTable('spiners')
		.set((eb) => ({
			dailySpins: power_badge ? 6 : 3,
			lastSpin: new Date().toLocaleString(),
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function updateRef(fid: string | null) {
	await db
		.updateTable('spiners')
		.set((eb) => ({
			dailySpins: eb('dailySpins', '+', 1),
		}))
		.where('fid', '=', fid)
		.execute()
}

export async function getTopPlayers(): Promise<any> {
	let data: any;
	try {
		data = await db
			.selectFrom('spiners')
			.select(['fid', 'username', 'points'])
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
			.selectFrom('spiners')
			.select('points')
			.where('fid', '=', fid)
			.executeTakeFirst();

		data = await db
			.selectFrom('spiners')
			.select(db.fn.countAll().as('count'))
			.where('points', '>', userPoints?.points ?? 0)
			.execute();
		return data[0]['count'];
	} catch (e: any) {
		console.error('Ошибка получения данных:', e.message);
		return false;
	}
}