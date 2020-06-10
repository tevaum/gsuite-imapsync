const imapsync = require('./imapsync');

module.exports = function (job, done) {
    console.log('Processing', job.data);

    const process = imapsync(job.data.uid);

    process.on('progress', progress => {
	console.log('Overall Progress', job.data, progress);
	job.progress(progress)
    });

    process.on('done', result => {
	console.log('Finishing', job.data, 'with code', result.code);
	job.progress(100).then(() => done(null, result));
    });

    process.on('error', result => {
	console.log('Finishing', job.data, 'with code', result.code);
	const error = new Error(result.error.join('\n'));
	error.code = result.code;
	error.data = result.error;
	job.progress(100).then(() => done(error));
    });
};
