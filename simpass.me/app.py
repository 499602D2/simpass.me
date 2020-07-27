# -*- coding: utf-8 -*-
# /usr/bin/python3
import os
import secrets
import logging

from flask import Flask, request, render_template, make_response, abort, send_from_directory
from flask_talisman import Talisman
from flask_seasurf import SeaSurf
from flask_htmlmin import HTMLMIN
from flask_minify import minify

from tools import load_config, calculate_bundle_hash

# create the flask app, set secret key
app = Flask(__name__)
app.secret_key = secrets.token_urlsafe(128)

# load configuration into app
app = load_config(app)

# use flask_seasurf to prevent cross-site request forging
csrf = SeaSurf(app)

# setup content security policy for flask_talisman
csp = {
	'default-src': {
		'\'self\'',
		'\'self\' data:',

		'googletagmanager.com',
		'cdnjs.cloudflare.com',
		'code.jquery.com',

		'*.google.com',
		'*.gstatic.com',
		'*.googleapis.com',
		'*.fontawesome.com'
	}
}

# use Flask Talisman for some common HTTP header security options
# https://github.com/GoogleCloudPlatform/flask-talisman
talisman = Talisman(
	app,
	content_security_policy=csp,
	content_security_policy_nonce_in=['default-src']
)

# minify HTML responses + CSS/JS, if not in debug mode
# use flask_htmlmin to minify HTML responses
app.config['MINIFY_HTML'] = True
htmlmin = HTMLMIN(app)

# use flask_minify to minify JS and CSS
minify(app=app, html=False, js=False, static=True)

# setup logging
logging.basicConfig(
	filename='app_log.log', level=logging.DEBUG,
	format='%(asctime)s %(message)s', datefmt='%d/%m/%Y %H:%M:%S'
)


@app.errorhandler(404)
def page_not_found(caught_error):
	"""Summary

	Args:
		e (TYPE): Caught exception

	Returns:
		TYPE: a 404 reponse + 404.html
	"""

	logging.error('404 error caught by page_not_found(): %s', caught_error)

	return render_template('index.html'), 404


@app.route('/favicon.ico')
def favicon():
	"""Summary
	Routes the request to /favicon.ico and returns the file.
	Returns:
		TYPE: A .ico-file
	"""

	return send_from_directory(
		os.path.join(app.root_path, 'static', 'css', 'img'),
		'favicon.png', mimetype='image/png'
	)


@app.route('/')
@app.route('/index')
def index():
	"""Summary
	Handles requests to / and /index.
	Returns:
		TYPE: Description
	"""

	return make_response(render_template(
			'index.html',
			analytics=app.config['ANALYTICS'],
			g_analytics_tracking_id=app.config['TRACKING_ID'],
			bundle_hash=calculate_bundle_hash()
		)
	)


@app.route('/<site_url>')
def load_url(site_url: str):
	"""Summary

	Args:
		site_url (str): URL a user is requesting to load

	Returns:
		TYPE: Description
	"""

	logging.info('User loaded %s page', site_url)

	# if url is invalid, abort with a 404 code
	valid_urls = {'', 'index'}
	if request.path.replace('/', '') not in valid_urls:
		abort(404)

	return make_response(render_template(
		'index.html',
		analytics=app.config['ANALYTICS'],
		g_analytics_tracking_id=app.config['TRACKING_ID'],
		bundle_hash=calculate_bundle_hash()
		)
	)


if __name__ == '__main__':
	app.run(debug=app.config['SERVER_DEBUG_MODE'],
		host=app.config['SERVER_HOST'],
		port=app.config['SERVER_PORT'])
