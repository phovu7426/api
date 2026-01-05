import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class DropLastPageFromReadingHistories1750000000610 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists before dropping
    const table = await queryRunner.getTable('reading_histories');
    const lastPageColumn = table?.findColumnByName('last_page');
    
    if (lastPageColumn) {
      await queryRunner.dropColumn('reading_histories', 'last_page');
    }

    // Also update chapter_id to be NOT NULL if it was nullable
    const chapterIdColumn = table?.findColumnByName('chapter_id');
    if (chapterIdColumn && chapterIdColumn.isNullable) {
      // Get foreign key before changing column
      const foreignKeys = table?.foreignKeys.filter(fk => fk.columnNames.includes('chapter_id'));
      const oldForeignKey = foreignKeys && foreignKeys.length > 0 ? foreignKeys[0] : null;
      
      // Drop old foreign key if exists
      if (oldForeignKey) {
        await queryRunner.dropForeignKey('reading_histories', oldForeignKey);
      }
      
      // Change column to NOT NULL
      await queryRunner.changeColumn(
        'reading_histories',
        'chapter_id',
        new TableColumn({
          name: 'chapter_id',
          type: 'bigint',
          unsigned: true,
          isNullable: false,
        }),
      );
      
      // Create new foreign key with CASCADE
      if (oldForeignKey) {
        await queryRunner.createForeignKey(
          'reading_histories',
          new TableForeignKey({
            columnNames: ['chapter_id'],
            referencedTableName: 'chapters',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back last_page column if rolling back
    const table = await queryRunner.getTable('reading_histories');
    const lastPageColumn = table?.findColumnByName('last_page');
    
    if (!lastPageColumn) {
      await queryRunner.addColumn(
        'reading_histories',
        new TableColumn({
          name: 'last_page',
          type: 'int',
          isNullable: true,
        }),
      );
    }
  }
}

