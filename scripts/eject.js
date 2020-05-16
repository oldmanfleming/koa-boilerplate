var fs = require('fs');

function remove(path) {
	fs.unlinkSync(path);
	console.log('Removed ' + path);
}

const removeList = [
	'src/controllers/ArticleController.ts',
	'src/controllers/ProfileController.ts',
	'src/controllers/TagController.ts',
	'src/entities/Article.ts',
	'src/entities/Comment.ts',
	'src/entities/Favorite.ts',
	'src/entities/Follow.ts',
	'src/entities/Tag.ts',
	'src/entities/User.ts',
	'src/repositories/ArticleRepository.ts',
	'src/repositories/CommentRepository.ts',
	'src/repositories/FavoriteRepository.ts',
	'src/repositories/FollowRepository.ts',
	'src/repositories/TagRepository.ts',
	'tests/unit/controllers/ArticleController.spec.ts',
	'tests/unit/controllers/ProfileController.spec.ts',
	'tests/unit/controllers/TagController.spec.ts',
	'tests/unit/repositories/FavoriteRepository.spec.ts',
	'tests/unit/repositories/FollowRepository.spec.ts',
	'migrations/1589068289816-InitialSchema.ts',
];

console.log('Beginning ejection...');

for (var i = 0; i < removeList.length; i++) {
	remove(removeList[i]);
}

fs.copyFileSync('scripts/templates/User.ts', 'src/entities/User.ts');
console.log('Added src/entities/User.ts');

fs.copyFileSync('scripts/templates/1589068289816-InitialSchema.ts', 'migrations/1589068289816-InitialSchema.ts');
console.log('Added 1589068289816-InitialSchema.ts');
