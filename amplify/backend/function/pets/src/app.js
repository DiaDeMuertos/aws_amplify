const AWS = require('aws-sdk');
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
var bodyParser = require('body-parser');
var express = require('express');
const uuid = require('uuid/v1');
const faker = require('faker');
const helpers = require('./helpers');

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = 'pets-table';
if (process.env.ENV && process.env.ENV !== 'NONE') {
  tableName = tableName + '-' + process.env.ENV;
}

const path = '/pets';

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

/**
 * PETS CREATE NEW
 */

app.post(path, function(req, res) {
  const item = { ...req.body, petId: uuid() };

  const queryParams = {
    TableName: tableName,
    Item: item,
  };

  dynamodb.put(queryParams, err => {
    if (err) {
      res.statusCode = 500;
      res.json({ success: false, error: err, body: req.body });
    } else {
      res.json({ success: true, data: item });
    }
  });
});

/**
 * PETS GET ALL
 */
app.get(path, function(req, res) {
  const { ProjectionExpression, FilterExpression, ExpressionAttributeValues } =
    req.apiGateway.event.queryStringParameters || {};

  const queryParams = {
    TableName: tableName,
    ...helpers.addProjectionExpression(ProjectionExpression),
    ...helpers.addFilterExpression(FilterExpression),
    ...helpers.addExpressionAttributeValues(ExpressionAttributeValues),
  };

  dynamodb.scan(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ success: false, error: err });
    } else {
      res.json({ success: true, data: data.Items });
    }
  });
});

/**
 * PETS GET BY ID
 */

app.get(path + '/:petId', function(req, res) {
  const { petId } = req.params;
  const { ProjectionExpression } = req.apiGateway.event.queryStringParameters || {};

  const queryParams = {
    TableName: tableName,
    Key: {
      petId: petId,
    },
    KeyConditionExpression: 'petId=:petId',
    ...helpers.addProjectionExpression(ProjectionExpression),
    ExpressionAttributeValues: {
      ':petId': petId,
    },
  };

  dynamodb.query(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ success: false, error: err, petId });
    } else {
      res.json({ success: true, data: data.Items.pop() });
    }
  });
});

app.listen(3000, function() {
  console.log('App started');
});

module.exports = app;
