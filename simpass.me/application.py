# -*- coding: utf-8 -*-
# /usr/bin/python3
import os
import secrets

from flask import Flask, request, render_template, make_response, abort, send_from_directory
from flask_talisman import Talisman
from flask_seasurf import SeaSurf
from flask_htmlmin import HTMLMIN

from config_tools import load_config, calculate_bundle_hash

# create the flask app, set secret key
application = Flask(__name__)
application.secret_key = secrets.token_urlsafe(128)

# load configuration into app
application = load_config(application, 'load_into_app')

# use flask_seasurf to prevent cross-site request forging
csrf = SeaSurf(application)

# setup content security policy for flask_talisman
csp = {
	'default-src': {
		'\'self\'',
		'\'self\' data:',

		'cdnjs.cloudflare.com',
		'code.jquery.com',
		'*.fontawesome.com'
	},

	'img-src': {
		'\'self\'',
		'\'self\' data:'
	}
}

# use Flask Talisman for some common HTTP header security options
# https://github.com/GoogleCloudPlatform/flask-talisman
talisman = Talisman(
	application,
	content_security_policy=csp,
	content_security_policy_nonce_in=['default-src']
)

# minify HTML responses + CSS/JS, if not in debug mode
# use flask_htmlmin to minify HTML responses
application.config['MINIFY_HTML'] = True
htmlmin = HTMLMIN(application)


@application.errorhandler(404)
def page_not_found(caught_error):
	"""Summary

	Args:
		e (TYPE): Caught exception

	Returns:
		TYPE: a 404 reponse + 404.html
	"""

	return render_template('index.html'), 404


@application.route('/favicon.ico')
def favicon():
	"""Summary
	Routes the request to /favicon.ico and returns the file.
	Returns:
		TYPE: A .ico-file
	"""

	return send_from_directory(
		os.path.join(application.root_path, 'static', 'css', 'img'),
		'favicon.webp', mimetype='image/webp'
	)


@application.route('/static/img/icons/apple-touch-icon.png')
def apple_touch_icon():
	return send_from_directory(
		os.path.join(
			application.root_path, 'static', 'css', 'img'),
		'apple-touch-icon.png', mimetype='image/png'
	)

@application.route('/robots.txt')
def robots_txt():
	return send_from_directory(
		os.path.join(application.root_path, 'static'),
		'robots.txt', mimetype='text/plain'
	)


@application.route('/')
@application.route('/index')
def index():
	"""Summary
	Handles requests to / and /index.
	Returns:
		TYPE: Description
	"""

	return make_response(render_template(
			'index.html',
			bundle_hash=calculate_bundle_hash()
		)
	)


@application.route('/<site_url>')
def load_url(site_url: str):
	"""Summary

	Args:
		site_url (str): URL a user is requesting to load

	Returns:
		TYPE: Description
	"""

	# if url is invalid, abort with a 404 code
	valid_urls = {'', 'index'}
	if request.path.replace('/', '') not in valid_urls:
		abort(404)

	return make_response(render_template(
		'index.html',
		bundle_hash=calculate_bundle_hash()
		)
	)


if __name__ == '__main__':
	application.run(debug=application.config['SERVER_DEBUG_MODE'],
		host=application.config['SERVER_HOST'],
		port=application.config['SERVER_PORT'])
