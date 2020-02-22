const addProjectionExpression = ProjectionExpression => (ProjectionExpression ? { ProjectionExpression } : null);

const addFilterExpression = FilterExpression => (FilterExpression ? { FilterExpression } : null);

const addExpressionAttributeValues = ExpressionAttributeValues =>
  ExpressionAttributeValues
    ? {
        ExpressionAttributeValues: ExpressionAttributeValues.split(',')
          .map(value => {
            const [k, v] = value.split('=');
            return { [k]: v };
          })
          .reduce((acc, value) => ({ ...acc, ...value }), {}),
      }
    : null;

module.exports = {
  addProjectionExpression,
  addFilterExpression,
  addExpressionAttributeValues,
};
