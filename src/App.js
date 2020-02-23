import React, { Component } from 'react';
import { API } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import faker from 'faker';
import './App.css';
class App extends Component {
  componentDidMount() {
    // this.callAPI();
    this.petsAPI();
  }

  callAPI = async () => {
    try {
      const create = await API.post('apia', '/items', { body: { itemName: faker.commerce.productName() } });
      console.log('TCL: App -> callAPI -> create', create);

      const getAll = await API.get('apia', '/items');
      console.log('TCL: App -> callAPI -> getAll', getAll);

      const item = getAll.data.pop();
      console.log('TCL: App -> callAPI -> item', item);

      const getById = await API.get('apia', `/items/${item.itemId}`);
      console.log('TCL: App -> callAPI -> getById', getById);

      const update = await API.put('apia', '/items', {
        body: {
          ...item,
          itemName: faker.commerce.productName(),
          price: faker.commerce.price(),
          productMaterial: faker.commerce.productMaterial(),
        },
      });
      console.log('TCL: App -> callAPI -> update', update);

      const remove = await API.del('apia', `/items/${item.itemId}`);
      console.log('TCL: App -> callAPI -> remove', remove);
    } catch (err) {
      console.error({ message: err });
    }
  };

  petsAPI = async () => {
    try {
      const petCreated = await API.post('pets', '/pets', {
        body: { petName: faker.commerce.productName(), price: faker.commerce.price() },
      });

      const pets = await API.get('pets', '/pets', {
        queryStringParameters: {
          ProjectionExpression: 'petId, price',
          FilterExpression: 'petName=:petName',
          ExpressionAttributeValues: ':petName=Licensed Rubber Fish',
        },
      });

      const pet = await API.get('pets', '/pets/99818060-55a4-11ea-adc9-99cc5ec17dab', {
        queryStringParameters: {
          ProjectionExpression: 'petId, petName',
        },
      });

      const updated = await API.put('pets', '/pets', {
        body: {
          petId: '99818060-55a4-11ea-adc9-99cc5ec17dab',
          price: faker.commerce.price(),
        },
      });

      const deleted = await API.del('pets', '/pets/99818060-55a4-11ea-adc9-99cc5ec17dab');

      console.log('TCL: App -> petsAPI -> CREATE', petCreated);
      console.log('TCL: App -> petsAPI -> ALL', pets);
      console.log('TCL: App -> petsAPI -> GET ONE', pet);
      console.log('TCL: App -> petsAPI -> UPDATE', updated);
      console.log('TCL: App -> petsAPI -> DELETE', deleted);
    } catch (err) {
      console.error({ message: err });
    }
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>aws_amplify_queries</h1>
        </header>
      </div>
    );
  }
}

export default withAuthenticator(App, true);
