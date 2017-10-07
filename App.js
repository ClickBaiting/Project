import React from 'react';
import { FlatList, Modal, StyleSheet, ToastAndroid, View } from 'react-native';
import {
  Button,
  FormInput,
  FormLabel,
  Header,
  Icon,
  List,
  ListItem,
  Text
} from 'react-native-elements';
import axios from 'axios';

export default class App extends React.Component {
  constructor(props, ctx) {
    super(props, ctx);

    this.editTodo = this.editTodo.bind(this);
    this.getTodos = this.getTodos.bind(this);
    this.handlePressAdd = this.handlePressAdd.bind(this);
    this.handlePressEdit = this.handlePressEdit.bind(this);
    this.renderRow = this.renderRow.bind(this);
    //this.toggleSwitch = this.toggleSwitch.bind(this);

    this.state = {
      addressInput: '',
      ageInput:'',
      contactInput:'',
      lastFoundInput: '',
      modalVisible: false,
      refreshing: false,
      nameInput: '',
      editId: null,
      mode: 'add',
      posts: [
        
      ]
    };
  }

  componentDidMount() {
    this.getTodos();
  }

  getTodos() {
    this.setState({ refreshing: true });

    return axios.get('http://192.168.200.103:3009/api/todos')
      .then(response => {
        const posts = response.data;
        
        this.setState({
          refreshing: false,
          posts: todos.map(function (post) {
            return {
              id: post.id,
              name: post.title,
              address: post.address,
              lastfound:post.lastfound,
              age:post.age
              //switched: !!post.done
            };
          })
        });
      })
      .catch(err => {
        this.setState({ refreshing: false });
        ToastAndroid.show(err.toString(), ToastAndroid.SHORT);
      });
  }

  handlePressEdit() {
    axios.put(`http://192.168.200.103:3009/api/todos/${this.state.editId}`, {
      title: this.state.nameInput,
      description: this.state.addressInput
    })
      .then(response => {
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT);

        this.setState({
          addressInput: '',
          modalVisible: false,
          nameInput: '',
          editId: null,
          mode: 'add'
        }, () => {
          this.getTodos();
        });
      });
  }

  handlePressAdd() {
    const posts = this.state.posts.concat();
    const payload = {
      title: this.state.nameInput,
      description: this.state.addressInput
    };

    axios.post('http://192.168.200.103:3009/api/todos', payload)
      .then(response => {
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT);

        this.setState({
          addressInput: '',
          modalVisible: false,
          nameInput: ''
        })
      })
      .catch(err => ToastAndroid.show(err.response.data.error, ToastAndroid.LONG))
      .then(this.getTodos);
  }

/*  toggleSwitch(index) {
    const { posts } = this.state;
    const todoItem = posts[index];

    this.setState({
      posts: [
        ...posts.slice(0, index),
        {
          ...todoItem,
          switched: !todoItem.switched
        },
        ...posts.slice(index + 1)
      ]
    });
  }*/

  editTodo(index) {
    const post = this.state.posts[index];

    this.setState({
      modalVisible: true,
      nameInput: post.name,
      addressInput: post.address,
      ageInput: post.age,

      mode: 'edit',
      editId: post.id
    });
  }

  renderRow({ item, index }) {
    return (
      <ListItem
        hideChevron={true}
        onPress={this.editTodo.bind(null, index)}
        //onSwitch={this.toggleSwitch.bind(null, index)}
        subtitle={item.address}
        subtitleStyle={{ color: item.switched ? '#009C6B' : '#a3a3a3' }}
        //switched={item.switched}
        //switchButton={true}
        name={item.name}
        titleStyle={{ color: item.switched ? '#009C6B' : '#000000' }}
      />
    );
  }

  render() {
    return (
      <View>
        <Modal
          animationType="slide"
          onRequestClose={() => this.setState({ modalVisible: false, mode: 'add' })}
          transparent={false}
          visible={this.state.modalVisible}>
          <View>
            <Text h4 style={{ textAlign: 'center' }}>{this.state.mode === 'add' ? 'Add' : 'Edit'} To-Do Item</Text>
            <FormLabel>Name</FormLabel>
            <FormInput onChangeText={text => this.setState({ nameInput: text })} value={this.state.nameInput} />
            <FormLabel>Address</FormLabel>
            <FormInput onChangeText={text => this.setState({ addressInput: text })} value={this.state.addressInput} />
            <FormLabel>Age</FormLabel>
            <FormInput onChangeText={text => this.setState({ ageInput: text })} value={this.state.ageInput} />
            <FormLabel>Contact no.</FormLabel>
            <FormInput onChangeText={text => this.setState({ contactInput: text })} value={this.state.contactInput} />
            <FormLabel>Last Founded</FormLabel>
            <FormInput onChangeText={text => this.setState({ lastFoundInput: text })} value={this.state.lastFoundInput} />
            <Button onPress={this.state.mode === 'add' ? this.handlePressAdd : this.handlePressEdit} title={this.state.mode === 'add' ? 'Add' : 'Save'} buttonStyle={{ marginBottom: 5 }} backgroundColor="#009C6B"/>
            <Button onPress={() => this.setState({ modalVisible: false, mode: 'add', addressInput: '', nameInput: '', editId: '' })} title="Close" />
          </View>
        </Modal>

        <Header
          leftComponent={{ icon: 'menu' }}
          centerComponent={{ text: 'Missing Persons' }}
          rightComponent={{ icon: 'add', onPress: () => this.setState({ modalVisible: true }) }}
        />
        <List containerStyle={{ marginTop: 70 }}>
          <FlatList
            data= {this.state.posts}
            keyExtractor={item => item.id}
            onRefresh={this.getTodos}
            refreshing={this.state.refreshing}
            renderItem={this.renderRow}
          />
        </List>
      </View>
    );
  }
}
