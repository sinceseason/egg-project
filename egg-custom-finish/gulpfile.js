const gulp = require('gulp');
const zip = require('gulp-zip');
const clean = require('gulp-clean');
const moment = require('moment');
gulp.task('clean', () => {
	return gulp
		.src('dist', {
			read: false,
			allowEmpty: true
		})
		.pipe(clean());
});
gulp.task('build:zip', () => {
	return gulp
		.src(['./**', '!./node_modules', '!./node_modules/**/*', '!./dist', '!./dist/**/*', '!./logs', '!./logs/**', '!./out', '!./out/**'])
		.pipe(zip(moment().format('YYYY-MM-DD') + '.zip'))
		.pipe(gulp.dest('dist'));
});
gulp.task('zip', gulp.series('clean', 'build:zip'));
