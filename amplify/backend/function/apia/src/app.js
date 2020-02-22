const AWS = require('aws-sdk');
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
var bodyParser = require('body-parser');
var express = require('express');
const uuid = require('uuid/v1');

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = 'items';
if (process.env.ENV && process.env.ENV !== 'NONE') {
  tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = 'itemId';
const partitionKeyType = 'S';
const sortKeyName = '';
const sortKeyType = '';
const hasSortKey = sortKeyName !== '';
const path = '/items';
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';

var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

/************************************
 * HTTP post method for insert object *
 *************************************/

app.post(path, function(req, res) {
  const item = { ...req.body, itemId: uuid() };
  const queryParams = {
    TableName: tableName,
    Item: item,
  };
  dynamodb.put(queryParams, err => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({ data: item });
    }
  });
});

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path, function(req, res) {
  const queryParams = {
    TableName: tableName,
  };

  dynamodb.scan(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: 'Could not load items: ' + err });
    } else {
      res.json({ data: data.Items });
    }
  });
});

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get(path + '/:itemId', function(req, res) {
  const { itemId } = req.params;

  const queryParams = {
    TableName: tableName,
    Key: {
      itemId: itemId,
    },
    KeyConditionExpression: 'itemId=:itemId',
    ExpressionAttributeValues: {
      ':itemId': itemId,
    },
  };

  dynamodb.query(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: 'Could not load items: ' + err.message });
    } else {
      res.json({ data: data.Items });
    }
  });
});

/************************************
 * HTTP put method for insert object *
 *************************************/

app.put(path, function(req, res) {
  const item = { ...req.body };

  const queryParams = {
    TableName: tableName,
    Item: item,
  };

  dynamodb.put(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({ data: item });
    }
  });
});

/**************************************
 * HTTP remove method to delete object *
 ***************************************/

app.delete(path + '/:itemId', function(req, res) {
  const { itemId } = req.params;

  const queryParams = {
    TableName: tableName,
    Key: {
      itemId: itemId,
    },
  };

  dynamodb.delete(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url });
    } else {
      res.json({ data: { itemId } });
    }
  });
});

app.listen(3000, function() {
  console.log('App started');
});

module.exports = app;
