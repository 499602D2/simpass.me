# -*- coding: utf-8 -*-
# /usr/bin/python3
import json
import os

def create_config():
	"""Summary
	Runs the config file setup if file doesn't exist or is corrupted/missing data.
	"""
	with open('server_config.json', 'w') as config_file:
		debug_mode = bool('y' in input('Run server in debug mode? (y/n): '))
		server_host = input('Enter server host address (default: 127.0.0.1): ')
		server_port = input('Enter server port (default: 5000): ')
		print()

		analytics = bool('y' in input('Use Google Analytics? (y/n): '))
		if analytics:
			tracking_id = input('Enter G Analytics tracking id: ')
		else:
			tracking_id = None

		config = {
			'SERVER_DEBUG_MODE': debug_mode,
			'SERVER_HOST': server_host,
			'SERVER_PORT': server_port,
			'ANALYTICS': analytics,
			'TRACKING_ID': tracking_id
		}

		json.dump(config, config_file, indent=4)


def load_config(app):
	"""Summary
	Load variables from configuration file.
	"""

	# if config file doesn't exist, create it
	if not os.path.isfile('server_config.json'):
		print('Server config file not found: performing setup.')
		create_config()

	with open('server_config.json', 'r') as config_file:
		try:
			config = json.load(config_file)
		except json.decoder.JSONDecodeError:
			print('JSONDecodeError: error loading configuration file. Running config setup...')
			create_config()
			config = json.load(config_file)

		try:
			# check if all the server config keys exist
			config_keys = {
				'SERVER_DEBUG_MODE', 'SERVER_HOST', 'SERVER_PORT',
				'ANALYTICS', 'TRACKING_ID'
			}

			# if there are any missing keys, re-run the setup
			# we're just taking the difference of the two key sets here
			if config_keys.difference(set(config.keys())) != set():
				print('Server configuration is missing some values: re-running setup...')
				create_config()

			# store configuration in app
			for key, val in config.items():
				app.config[key] = val

			return app
		except KeyError:
			print('KeyError: configuration is missing data. Running config setup...')
			create_config()
