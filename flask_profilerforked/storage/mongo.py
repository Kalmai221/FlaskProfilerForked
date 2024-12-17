import time
import datetime
import pymongo
from .base import BaseStorage
from bson.objectid import ObjectId


class Mongo(BaseStorage):
    """
    To use this class, you have to provide a config dictionary which contains
    "MONGO_URL", "DATABASE" and "COLLECTION".
    """

    def __init__(self, config=None):
        super(Mongo, self).__init__()
        self.config = config
        self.mongo_url = self.config.get("MONGO_URL", "mongodb://localhost")
        self.database_name = self.config.get("DATABASE", "flask_profiler")
        self.collection_name = self.config.get("COLLECTION", "measurements")

        # Initialize MongoDB client and create index
        self.client = pymongo.MongoClient(self.mongo_url)
        self.db = self.client[self.database_name]
        self.collection = self.db[self.collection_name]
        self.create_index()

    def create_index(self):
        self.collection.create_index([
            ('startedAt', 1),
            ('endedAt', 1),
            ('elapsed', 1),
            ('name', 1),
            ('method', 1)
        ])

    def filter(self, filtering={}):
        query = {}
        limit = int(filtering.get('limit', 100000))
        skip = int(filtering.get('skip', 0))
        sort = filtering.get('sort', "endedAt,desc").split(",")

        # Parse time filters
        startedAt = datetime.datetime.fromtimestamp(float(filtering.get('startedAt', time.time() - 3600 * 24 * 7)))
        endedAt = datetime.datetime.fromtimestamp(float(filtering.get('endedAt', time.time())))

        # Build query
        if filtering.get('name'):
            query['name'] = filtering['name']
        if filtering.get('method'):
            query['method'] = filtering['method']
        if filtering.get('elapsed'):
            query['elapsed'] = {"$gte": float(filtering['elapsed'])}
        query['endedAt'] = {"$lte": endedAt}
        query['startedAt'] = {"$gt": startedAt}

        # Execute query with sorting and pagination
        cursor = self.collection.find(query).sort(sort[0], pymongo.DESCENDING if sort[1] == "desc" else pymongo.ASCENDING).skip(skip).limit(limit)
        return (self.clearify(record) for record in cursor)

    def insert(self, measurement):
        measurement["startedAt"] = datetime.datetime.fromtimestamp(measurement["startedAt"])
        measurement["endedAt"] = datetime.datetime.fromtimestamp(measurement["endedAt"])

        result = self.collection.insert_one(measurement)
        return result.acknowledged

    def truncate(self):
        result = self.collection.delete_many({})
        return result.deleted_count > 0

    def delete(self, measurementId):
        result = self.collection.delete_one({"_id": ObjectId(measurementId)})
        return result.deleted_count > 0

    def delete_all(self):
        """
        Delete all documents in the collection.
        """
        result = self.collection.delete_many({})
        return result.deleted_count > 0  # Returns True if any documents were deleted

    def getSummary(self, filtering={}):
        match_condition = {}
        endedAt = datetime.datetime.fromtimestamp(float(filtering.get('endedAt', time.time())))
        startedAt = datetime.datetime.fromtimestamp(float(filtering.get('startedAt', time.time() - 3600 * 24 * 7)))
        elapsed = filtering.get('elapsed', None)
        name = filtering.get('name', None)
        method = filtering.get('method', None)
        sort = filtering.get('sort', "count,desc").split(",")

        if name:
            match_condition['name'] = name
        if method:
            match_condition['method'] = method
        if endedAt:
            match_condition['endedAt'] = {"$lte": endedAt}
        if startedAt:
            match_condition['startedAt'] = {"$gt": startedAt}
        if elapsed:
            match_condition['elapsed'] = {"$gte": elapsed}

        sort_dir = -1 if sort[1] == "desc" else 1

        return self.aggregate([
            {"$match": match_condition},
            {
                "$group": {
                    "_id": {
                        "method": "$method",
                        "name": "$name"
                    },
                    "count": {"$sum": 1},
                    "minElapsed": {"$min": "$elapsed"},
                    "maxElapsed": {"$max": "$elapsed"},
                    "avgElapsed": {"$avg": "$elapsed"}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "method": "$_id.method",
                    "name": "$_id.name",
                    "count": 1,
                    "minElapsed": 1,
                    "maxElapsed": 1,
                    "avgElapsed": 1
                }
            },
            {
                "$sort": {sort[0]: sort_dir}
            }
        ])

    def getMethodDistribution(self, filtering=None):
        if not filtering:
            filtering = {}

        startedAt = datetime.datetime.fromtimestamp(float(
            filtering.get('startedAt', time.time() - 3600 * 24 * 7)))
        endedAt = datetime.datetime.fromtimestamp(
            float(filtering.get('endedAt', time.time())))

        match_condition = {
            "startedAt": {"$gte": startedAt},
            "endedAt": {"$lte": endedAt}
        }

        result = self.aggregate([
            {"$match": match_condition},
            {
                "$group": {
                    "_id": {
                        "method": "$method"
                    },
                    "count": {"$sum": 1}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "method": "$_id.method",
                    "count": 1
                }
            }
        ])

        distribution = {i["method"]: i["count"] for i in result}
        return distribution

    def getTimeseries(self, filtering=None):
        if not filtering:
            filtering = {}
        if filtering.get('interval', None) == "daily":
            dateFormat = '%Y-%m-%d'
            interval = 3600 * 24  # daily
            groupId = {
                "month": {"$month": "$startedAt"},
                "day": {"$dayOfMonth": "$startedAt"},
                "year": {"$year": "$startedAt"}
            }
        else:
            dateFormat = '%Y-%m-%d %H'
            interval = 3600  # hourly
            groupId = {
                "hour": {"$hour": "$startedAt"},
                "day": {"$dayOfMonth": "$startedAt"},
                "month": {"$month": "$startedAt"},
                "year": {"$year": "$startedAt"}
            }

        startedAt = float(filtering.get('startedAt', time.time() - 3600 * 24 * 7))
        startedAtF = datetime.datetime.fromtimestamp(startedAt)
        endedAt = float(filtering.get('endedAt', time.time()))
        endedAtF = datetime.datetime.fromtimestamp(endedAt)

        match_condition = {
            "startedAt": {"$gte": startedAtF},
            "endedAt": {"$lte": endedAtF}
        }
        result = self.aggregate([
            {"$match": match_condition},
            {
                "$group": {
                    "_id": groupId,
                    "startedAt": {"$first": "$startedAt"},
                    "count": {"$sum": 1},
                }
            }
        ])
        series = {}
        for i in range(int(startedAt), int(endedAt) + 1, interval):
            series[datetime.datetime.fromtimestamp(i).strftime(dateFormat)] = 0

        for i in result:
            series[i["startedAt"].strftime(dateFormat)] = i["count"]
        return series

    def clearify(self, obj):
        if 'startedAt' in obj:
            obj["startedAt"] = int(obj["startedAt"].timestamp())  # Convert to UNIX timestamp
        if 'endedAt' in obj:
            obj["endedAt"] = int(obj["endedAt"].timestamp())  # Convert to UNIX timestamp

        for k, v in list(obj.items()):
            if isinstance(v, (int, dict, str, list)):
                continue
            if k == "_id":
                obj["id"] = str(v)
                del obj["_id"]
            else:
                obj[k] = str(v)

        return obj

    def get(self, measurementId):
        record = self.collection.find_one({'_id': ObjectId(measurementId)})
        return self.clearify(record) if record else None

    def aggregate(self, pipeline, **kwargs):
        """Perform an aggregation and make sure that result will be every time
        CommandCursor. Will take care of pymongo version differences
        :param pipeline: {list} of aggregation pipeline stages
        :return: {pymongo.command_cursor.CommandCursor}
        """
        result = self.collection.aggregate(pipeline, **kwargs)
        if pymongo.version_tuple < (3, 0, 0):
            result = result['result']

        return result
