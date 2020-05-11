import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1589068289816 implements MigrationInterface {
	name: string = 'InitialSchema1589068289816';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "body" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "articleId" integer, "authorId" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
			undefined,
		);
		await queryRunner.query(
			`CREATE TABLE "follows" ("id" SERIAL NOT NULL, "followerId" integer, "followingId" integer, CONSTRAINT "PK_8988f607744e16ff79da3b8a627" PRIMARY KEY ("id"))`,
			undefined,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_105079775692df1f8799ed0fac" ON "follows" ("followerId", "followingId") `,
			undefined,
		);
		await queryRunner.query(
			`CREATE TABLE "favorites" ("id" SERIAL NOT NULL, "articleId" integer, "userId" integer, CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`,
			undefined,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_a399865198a065686cbb981db4" ON "favorites" ("articleId", "userId") `,
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
			`CREATE TABLE "articles_tag_list_tags" ("articlesId" integer NOT NULL, "tagsLabel" character varying NOT NULL, CONSTRAINT "PK_6f68e67134c96e7678b45251252" PRIMARY KEY ("articlesId", "tagsLabel"))`,
			undefined,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_77fbcba9604a1725f5ac5f5aac" ON "articles_tag_list_tags" ("articlesId") `,
			undefined,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_986b099ae32d34809dd29db3d0" ON "articles_tag_list_tags" ("tagsLabel") `,
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
			`ALTER TABLE "follows" ADD CONSTRAINT "FK_fdb91868b03a2040db408a53331" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "follows" ADD CONSTRAINT "FK_ef463dd9a2ce0d673350e36e0fb" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "favorites" ADD CONSTRAINT "FK_a9e25be94f65c6f11f420d97bca" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "favorites" ADD CONSTRAINT "FK_e747534006c6e3c2f09939da60f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "articles_tag_list_tags" ADD CONSTRAINT "FK_77fbcba9604a1725f5ac5f5aaca" FOREIGN KEY ("articlesId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "articles_tag_list_tags" ADD CONSTRAINT "FK_986b099ae32d34809dd29db3d00" FOREIGN KEY ("tagsLabel") REFERENCES "tags"("label") ON DELETE CASCADE ON UPDATE NO ACTION`,
			undefined,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "articles_tag_list_tags" DROP CONSTRAINT "FK_986b099ae32d34809dd29db3d00"`,
			undefined,
		);
		await queryRunner.query(
			`ALTER TABLE "articles_tag_list_tags" DROP CONSTRAINT "FK_77fbcba9604a1725f5ac5f5aaca"`,
			undefined,
		);
		await queryRunner.query(`ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`, undefined);
		await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_e747534006c6e3c2f09939da60f"`, undefined);
		await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_a9e25be94f65c6f11f420d97bca"`, undefined);
		await queryRunner.query(`ALTER TABLE "follows" DROP CONSTRAINT "FK_ef463dd9a2ce0d673350e36e0fb"`, undefined);
		await queryRunner.query(`ALTER TABLE "follows" DROP CONSTRAINT "FK_fdb91868b03a2040db408a53331"`, undefined);
		await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`, undefined);
		await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_b0011304ebfcb97f597eae6c31f"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_986b099ae32d34809dd29db3d0"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_77fbcba9604a1725f5ac5f5aac"`, undefined);
		await queryRunner.query(`DROP TABLE "articles_tag_list_tags"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_1123ff6815c5b8fec0ba9fec37"`, undefined);
		await queryRunner.query(`DROP TABLE "articles"`, undefined);
		await queryRunner.query(`DROP TABLE "tags"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_fe0bb3f6520ee0469504521e71"`, undefined);
		await queryRunner.query(`DROP TABLE "users"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_a399865198a065686cbb981db4"`, undefined);
		await queryRunner.query(`DROP TABLE "favorites"`, undefined);
		await queryRunner.query(`DROP INDEX "IDX_105079775692df1f8799ed0fac"`, undefined);
		await queryRunner.query(`DROP TABLE "follows"`, undefined);
		await queryRunner.query(`DROP TABLE "comments"`, undefined);
	}
}
