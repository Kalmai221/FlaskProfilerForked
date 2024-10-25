# -*- coding: utf8 -*-
# FORKED VERSION

import functools
import re
import time
import requests
import os

from pprint import pprint as pp

import logging

from flask import Blueprint, jsonify, request, make_response
from flask_httpauth import HTTPBasicAuth

from . import storage

CONF = {}
collection = None
auth = HTTPBasicAuth()

logger = logging.getLogger("flask-profiler")

_is_initialized = lambda: True if CONF else False

@auth.verify_password
def verify_password(username, password):
    if "basicAuth" not in CONF or not CONF["basicAuth"]["enabled"]:
        return True

    c = CONF["basicAuth"]
    if username == c["username"] and password == c["password"]:
        return True
    logging.warn("flask-profiler authentication failed")
    return False


class Measurement(object):
    """represents an endpoint measurement"""
    DECIMAL_PLACES = 6

    def __init__(self, name, args, kwargs, method, context=None):
        super(Measurement, self).__init__()
        self.context = context
        self.name = name
        self.method = method
        self.args = args
        self.kwargs = kwargs
        self.startedAt = 0
        self.endedAt = 0
        self.elapsed = 0

    def __json__(self):
        return {
            "name": self.name,
            "args": self.args,
            "kwargs": self.kwargs,
            "method": self.method,
            "startedAt": self.startedAt,
            "endedAt": self.endedAt,
            "elapsed": self.elapsed,
            "context": self.context
        }

    def __str__(self):
        return str(self.__json__())

    def start(self):
        # we use default_timer to get the best clock available.
        # see: http://stackoverflow.com/a/25823885/672798
        self.startedAt = time.time()

    def stop(self):
        self.endedAt = time.time()
        self.elapsed = round(
            self.endedAt - self.startedAt, self.DECIMAL_PLACES)


def is_ignored(name, conf):
    ignore_patterns = conf.get("ignore", [])
    for pattern in ignore_patterns:
        if re.search(pattern, name):
            return True
    return False


def measure(f, name, method, context=None):
    logger.debug("{0} is being processed.".format(name))
    if is_ignored(name, CONF):
        logger.debug("{0} is ignored.".format(name))
        return f

    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        if 'sampling_function' in CONF and not callable(CONF['sampling_function']):
            raise Exception(
                "if sampling_function is provided to flask-profiler via config, "
                "it must be callable, refer to: "
                "https://github.com/muatik/flask-profiler#sampling")

        if 'sampling_function' in CONF and not CONF['sampling_function']():
            return f(*args, **kwargs)

        measurement = Measurement(name, args, kwargs, method, context)
        measurement.start()

        try:
            returnVal = f(*args, **kwargs)
        except:
            raise
        finally:
            measurement.stop()
            if CONF.get("verbose", False):
                pp(measurement.__json__())
            collection.insert(measurement.__json__())

        return returnVal

    return wrapper


def wrapHttpEndpoint(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        context = {
            "url": request.base_url,
            "args": dict(request.args.items()),
            "form": dict(request.form.items()),
            "body": request.data.decode("utf-8", "strict"),
            "headers": dict(request.headers.items()),
            "func": request.endpoint,
            "ip": request.remote_addr
        }
        endpoint_name = str(request.url_rule)
        wrapped = measure(f, endpoint_name, request.method, context)
        return wrapped(*args, **kwargs)

    return wrapper


def wrapAppEndpoints(app):
    """
    wraps all endpoints defined in the given flask app to measure how long time
    each endpoints takes while being executed. This wrapping process is
    supposed not to change endpoint behaviour.
    :param app: Flask application instance
    :return:
    """
    for endpoint, func in app.view_functions.items():
        app.view_functions[endpoint] = wrapHttpEndpoint(func)


def profile(*args, **kwargs):
    """
    http endpoint decorator
    """
    if _is_initialized():
        def wrapper(f):
            return wrapHttpEndpoint(f)

        return wrapper
    raise Exception(
        "before measuring anything, you need to call init_app()")
    
def check_version():
        # URL to fetch the remote version.txt
        remote_url = 'https://raw.githubusercontent.com/Kalmai221/flask-profiler/refs/heads/master/flask_profiler/version.txt'
        local_version = "Unknown"  # Default value in case of an error

        try:
            # Fetch remote version.txt content
            response = requests.get(remote_url)
            response.raise_for_status()  # Raise exception if the request fails
            remote_version = response.text.strip()
            print(f"Remote Version: {remote_version}")

            with open("static/dist/version.txt", 'r') as local_file:
                local_version = local_file.read().strip()
                print(f"Local Version: {local_version}")

            # Compare the versions
            if remote_version == local_version:
                return [True, local_version, remote_version]
            else:
                return [False, local_version, remote_version]

        except requests.exceptions.RequestException:
            return [None, local_version, "Error fetching remote version"]

        except FileNotFoundError:
            # Handle the case where version.txt does not exist
            return [None, "File not found", "Error"]

def registerInternalRouters(app):
    """
    These are the endpoints which are used to display measurements in the
    flask-profiler dashboard.

    Note: these should be defined after wrapping user defined endpoints
    via wrapAppEndpoints()
    :param app: Flask application instance
    :return:
    """
    urlPath = CONF.get("endpointRoot", "profiler")

    fp = Blueprint(
        'flask-profiler', __name__,
        url_prefix="/" + urlPath,
        static_folder="static/dist/", static_url_path='/static/dist')
    
    @fp.route('/')
    @auth.login_required
    def index():
        # URLs to fetch the remote and local version.txt
        if CONF["updateCheck"]:
            remote_url = 'https://raw.githubusercontent.com/Kalmai221/flask-profiler/refs/heads/master/flask_profiler/static/dist/version.txt'
            local_url = request.base_url + 'static/dist/version.txt'  # Update with your actual URL

            try:
                # Fetch remote version.txt content
                remote_response = requests.get(remote_url)
                remote_response.raise_for_status()  # Raise exception if the request fails
                remote_version = remote_response.text.strip()

                # Fetch local version.txt content
                local_response = requests.get(local_url)
                local_response.raise_for_status()  # Raise exception if the request fails
                local_version = local_response.text.strip()

                # Compare the versions
                update_available = remote_version != local_version

            except requests.exceptions.RequestException as e:
                update_available = None
                local_version = "Error"
                remote_version = "Error"
        else:
            update_available = False
            local_version = "Unknown"
            remote_version = "Unknown"

        # Serve the HTML file
        response = fp.send_static_file("index.html")

        # Set custom headers for version information
        response.headers['X-Update-Available'] = str(update_available)
        response.headers['X-Local-Version'] = local_version
        response.headers['X-Remote-Version'] = remote_version

        return response

    @fp.route("/api/measurements/".format(urlPath))
    @auth.login_required
    def filterMeasurements():
        args = dict(request.args.items())
        measurements = collection.filter(args)
        return jsonify({"measurements": list(measurements)})

    @fp.route("/api/measurements/grouped".format(urlPath))
    @auth.login_required
    def getMeasurementsSummary():
        args = dict(request.args.items())
        measurements = collection.getSummary(args)
        return jsonify({"measurements": list(measurements)})
    
    @fp.route("/api/measurements/deleteall".format(urlPath))
    @auth.login_required
    def delete_all_measurements():
        try:
            deleted_count = collection.delete_all()
            if deleted_count:
                return jsonify({"message": "All measurements have been deleted."}), 200
            else:
                return jsonify({"message": "No measurements found to delete."}), 404
        except Exception as e:
            return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    @fp.route("/api/measurements/<measurementId>".format(urlPath))
    @auth.login_required
    def getContext(measurementId):
        return jsonify(collection.get(measurementId))

    @fp.route("/api/measurements/timeseries/".format(urlPath))
    @auth.login_required
    def getRequestsTimeseries():
        args = dict(request.args.items())
        return jsonify({"series": collection.getTimeseries(args)})

    @fp.route("/api/measurements/methodDistribution/".format(urlPath))
    @auth.login_required
    def getMethodDistribution():
        args = dict(request.args.items())
        return jsonify({
            "distribution": collection.getMethodDistribution(args)})

    @fp.route("/db/dumpDatabase")
    @auth.login_required
    def dumpDatabase():
        response = jsonify({
            "summary": collection.getSummary()})
        response.headers["Content-Disposition"] = "attachment; filename=dump.json"
        return response

    @fp.route("/db/deleteDatabase")
    @auth.login_required
    def deleteDatabase():
        response = jsonify({
            "status": collection.truncate()})
        return response

    @fp.after_request
    def x_robots_tag_header(response):
        response.headers['X-Robots-Tag'] = 'noindex, nofollow'
        return response

    app.register_blueprint(fp)


def init_app(app):
    global collection, CONF

    try:
        CONF = app.config["flask_profiler"]
    except:
        try:
            CONF = app.config["FLASK_PROFILER"]
        except:
            raise Exception(
                "to init flask-profiler, provide "
                "required config through flask app's config. please refer: "
                "https://github.com/muatik/flask-profiler")

    if not CONF.get("enabled", False):
        return

    collection = storage.getCollection(CONF.get("storage", {}))

    wrapAppEndpoints(app)
    registerInternalRouters(app)

    basicAuth = CONF.get("basicAuth", None)
    if not basicAuth or not basicAuth["enabled"]:
        logging.warn(" * CAUTION: flask-profiler is working without basic auth!")


class Profiler(object):
    """ Wrapper for extension. """

    def __init__(self, app=None):
        self._init_app = init_app
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        init = functools.partial(self._init_app, app)
        app.before_first_request(init)
