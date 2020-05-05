import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1588692366410 implements MigrationInterface {
	name: string = 'InitialSchema1588692366410';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "articleId" integer, "authorId" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
			undefined,
		);
		await queryRunner.query(
			`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "bio" character varying NOT NULL DEFAULT '', "image" character varying NOT NULL DEFAULT '', "password" character varying NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
			undefined,
		);
		await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `, undefined);
		await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `, undefined);
		await queryRunner.query(
			`CREATE TABLE "tags" ("label" character varying NOT NULL, CONSTRAINT "PK_c3f918aeb3a1bba2e46f5945809" PRIMARY KEY ("label"))`,
			undefined,
		);
		await queryRunner.query(
			`CREATE TABLE "articles" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "body" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "authorId" integer, CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`,
			undefined,
		);
		await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1123ff6815c5b8fec0ba9fec37" ON "articles" ("slug") `, undefined);
		await queryRunner.query(
			`CREATE TABLE "users_followers_users" ("usersId_1" integer NOT NULL, "usersId_2" integer NOT NULL, CONSTRAINT "PK_ee8a9c5a097f32b484caaeb3de7" PRIMARY KEY ("usersId_1", "usersId_2"))`,
			undefined,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_8d63f6043394b4d32343bdea11" ON "users_followers_users" ("usersId_1") `,
			undefined,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_1433e3275a501bc09f5c33c7ca" ON "users_followers_users" ("usersId_2") `,
			undefined,
		);
		await queryRunner.query(
			`CREATE TABLE "users_favorites_articles" ("usersId" integer NOT NULL, "articlesId" integer NOT NULL, CONSTRAINT "PK_aebb5070a5fa58957adae6d78af" PRIMARY KEY ("usersId", "articlesId"))`,
			undefined,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_b3bc5ca3e98f5f3858dbf626ad" ON "users_favorites_articles" ("usersId") `,
			undefined,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_61dc60abcf0035e5ce2aea013b" ON "users_favorites_articles" ("articlesId") `,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "comments" ADD CONSTRAINT "FK_b0011304ebfcb97f597eae6c31f" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "users_followers_users" ADD CONSTRAINT "FK_8d63f6043394b4d32343bdea11d" FOREIGN KEY ("usersId_1") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "users_followers_users" ADD CONSTRAINT "FK_1433e3275a501bc09f5c33c7ca2" FOREIGN KEY ("usersId_2") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "users_favorites_articles" ADD CONSTRAINT "FK_b3bc5ca3e98f5f3858dbf626ad6" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "users_favorites_articles" ADD CONSTRAINT "FK_61dc60abcf0035e5ce2aea013bc" FOREIGN KEY ("articlesId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
			undefined,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "users_favorites_articles" DROP CONSTRAINT "FK_61dc60abcf0035e5ce2aea013bc"`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "users_favorites_articles" DROP CONSTRAINT "FK_b3bc5ca3e98f5f3858dbf626ad6"`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "users_followers_users" DROP CONSTRAINT "FK_1433e3275a501bc09f5c33c7ca2"`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "users_followers_users" DROP CONSTRAINT "FK_8d63f6043394b4d32343bdea11d"`,
			undefined,
		);
		await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`, undefined);
		await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`, undefined);
		await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_b0011304ebfcb97f597eae6c31f"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_61dc60abcf0035e5ce2aea013b"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_b3bc5ca3e98f5f3858dbf626ad"`, undefined);
		await queryRunner.query(`DROP TABLE "users_favorites_articles"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_1433e3275a501bc09f5c33c7ca"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_8d63f6043394b4d32343bdea11"`, undefined);
		await queryRunner.query(`DROP TABLE "users_followers_users"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_1123ff6815c5b8fec0ba9fec37"`, undefined);
		await queryRunner.query(`DROP TABLE "articles"`, undefined);
		await queryRunner.query(`DROP TABLE "tags"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_fe0bb3f6520ee0469504521e71"`, undefined);
		await queryRunner.query(`DROP TABLE "users"`, undefined);
		await queryRunner.query(`DROP TABLE "comments"`, undefined);
	}
}
