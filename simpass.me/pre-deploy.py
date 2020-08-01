import os
import zipfile
import time

from config_tools import load_config, store_config, calculate_bundle_hash

def package_contents():
	"""Summary
	Archive the contents so they can be deployed
	"""

	def zipdir(path, ziph, ignored_files, ignored_directories):
		"""Summary
		Walks down path and zips everything
		"""
		# ziph is zipfile handle
		for root, dirs, files in os.walk(path):
			for file in files:
				if not any(ignored_dir in root for ignored_dir in ignored_directories):
					if not any(ignored_fname in file for ignored_fname in ignored_files):
						ziph.write(os.path.join(root, file))


	print('🗜 Starting directory compress...')

	build_dir = os.path.join(os.getcwd(), 'build')
	if not os.path.isdir(build_dir):
		os.makedirs(build_dir, exist_ok=True)

	this_dir = os.path.dirname(os.path.abspath(__file__))
	dist_dir = os.path.join(this_dir, 'build')
	build_fname = f'deploy-{int(time.time())}.zip'

	if not os.path.exists(dist_dir):
		os.makedirs(dist_dir)

	zip_path = os.path.join(dist_dir, build_fname)
	zipf = zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_STORED)

	# ignored dirs
	ignored_dirs = {
		'build', 'node_modules'
	}

	# ignored files
	ignored_files = {
		build_fname, 'predeploy.py', 'package-lock.json', 'package.json'
	}

	print('⚠️ Ignoring the following dirs and files from deploy:')
	for ignored_dir in ignored_dirs:
		print(f'\t/{ignored_dir}')

	for ignored_file in ignored_files:
		print(f'\t{ignored_file}')

	zipdir('.', zipf, ignored_files, ignored_dirs)
	zipf.close()

	print(f'✅ Archive built into {dist_dir}/{build_fname}')


def verify_configuration():
	"""Summary
	Verifies that the deployed configuration file is correct.
	- no debug mode enabled
	- ask user if variables are OK
	"""
	config = load_config(app=None, mode='load_into_json')

	if config['SERVER_DEBUG_MODE']:
		print('⚠️ Server debug mode is set to True')
		use_debug_mode = bool('y' in input('> Use debug=True? (y/n): '))
		if not use_debug_mode:
			config['SERVER_DEBUG_MODE'] = False
			store_config(config)


def compress_scripts(input_files):
	"""Summary
	Compress scripts listed in input_files
	"""
	#install_npm_deps()

	for fname in input_files:
		# run browserify, shake
		fname_out = fname.replace('scripts.js', 'bundle.js')
		shell_call = f'browserify -p common-shakeify {fname} > {fname_out}'

		print(f'🌎 Running browserify with {shell_call}')
		os.system(shell_call)
		print('✅ Browserify run completed!\n')

		# set scripts.js to bundle.js
		fname = fname_out

		fname_out = fname.replace('.js', '.min.js')
		shell_args = f'minify {fname} --out-file {fname_out} --mangle'
		shell_call = f'{shell_args}'

		print(f'🔨 Calling babel-minify with $ {shell_call}')
		os.system(shell_call)

		# compression efficiency
		fs_uncompressed = os.path.getsize(fname)
		fs_compressed = os.path.getsize(fname_out)
		fsize = (fs_compressed / fs_uncompressed)*100

		# calculate MD5 for bundle.js
		bundle_md5 = calculate_bundle_hash()

		print(f'✅ ({fsize:.2f}%) {fname} -> {fname_out}')
		print(f'🔑 MD5: {bundle_md5}')

		# inject MD5 into readme.md
		this_dir = os.path.dirname(os.path.abspath(__file__))
		repo_root = '/'.join(this_dir.split('/')[0:-1])
		with open(os.path.join(repo_root, 'README.md'), 'rb') as file:
			file_content = file.readlines()

		last_line = file_content[-1].decode()
		old_md5 = last_line.split(' ')[-1]
		new_hash_entry = last_line.replace(old_md5, f'`{bundle_md5}`')

		with open(os.path.join(repo_root, 'README.md'), 'wb') as file:
			file_content[-1] = new_hash_entry.encode()
			for line in file_content:
				file.write(line)

		print('✅ MD5 written into README.md!')


	print('✅ Scripts minified!\n')


def compress_static():
	print('🔨 Minifying styles.css to styles.min.css...')
	shell_call = 'postcss static/css/styles.css > static/css/styles.min.css'
	os.system(shell_call)

	# compression efficiency
	fs_uncompressed = os.path.getsize('static/css/styles.css')
	fs_compressed = os.path.getsize('static/css/styles.min.css')
	fsize = (fs_compressed / fs_uncompressed)*100

	print(f'✅ ({fsize}%) Styles compressed!\n')


def install_npm_deps():
	"""Summary
	Install babel-minify from npm
	"""
	try:
		print('🔍 verifying browserify is installed...')
		shell_call = 'npm install browserify --save-dev -g'
		os.system(shell_call)
		print('✅ browserify installed\n')

		print('🔍 verifying babel-minify is installed...')
		shell_call = 'npm install babel-minify --save-dev -g'
		os.system(shell_call)
		print('✅ babel-minify installed\n')

		print('🔍 verifying postcss-cli is installed...')
		shell_call = 'npm install postcss-cli --save-dev -g'
		os.system(shell_call)
		print('✅ postcss-cli installed\n')

		print('🔍 verifying common-shakeify is installed...')
		shell_call = 'npm install --save-dev common-shakeify -g'
		os.system(shell_call)
		print('✅ common-shakeify installed\n')

		print('🔍 verifying crypto-random-string is installed...')
		shell_call = 'npm install crypto-random-string'
		os.system(shell_call)
		print('✅ crypto-random-string installed\n')

		print('🔍 verifying string-entropy is installed...')
		shell_call = 'npm install string-entropy'
		os.system(shell_call)
		print('✅ string-entropy installed\n')
	except Exception as error:
		print(error)
		print('? babel-minify already installed?\n')


if __name__ == '__main__':
	# npm notice
	print('⚠️ NOTE: this script requires that you have NPM installed.\n')

	# 1. verify config
	verify_configuration()

	# 3. compress scripts
	scripts_to_compress = {os.path.join('static', 'scripts', 'scripts.js')}
	compress_scripts(scripts_to_compress)

	# 4. package contents
	package_contents()

	print('✅ All done!')
