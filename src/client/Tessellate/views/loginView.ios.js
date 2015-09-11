'use strict';
 
var React = require('react-native');
var Main = require('./mainView.ios.js');
var FBLogin = require('react-native-facebook-login');
var FBLoginManager = require('NativeModules').FBLoginManager;

var {
  StyleSheet,
  TouchableHighlight,
  View,
  Text,
  Component,
  TextInput,
  Image,
  AlertIOS,
  
} = React;

var styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#1B2B32',
	},
  fbLogo: {
    width:300,
    height:45,
    backgroundColor:'#125989',
    marginTop:20,
    borderRadius:10,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  fbLogoText: {
    textAlign:'center',
    color:'#FFFFFF',
    fontSize:20,
  },
  logo: {
    width:400,
    height:400,
  }

});



class LoginView extends Component {
  constructor(props){
    super(props);
    this.state = {
      loggedIn:false,
    }
  }

  isAuthorized(loginState){
    console.log('transitioning')
    if (loginState){
      this.props.navigator.push({
        title: "Tessellate",
        component:Main,
        passProps:{currentUser:'Jonathan Schapiro',
        profilePicture:'.img'}
      })
      this.props.refs.setState({navBarHidden:true}) 
    }
  }

  login() {
 
    var self = this;
    var loginObject = {  
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': '',
        'Host': 'http://localhost:8081'
      }
    }

    //REFACTOR
    fetch('http://localhost:8000/', loginObject)  
      .then(function(res) {
        console.log(res)
        return {};
       })
      .then(function(resJson) {
        self.isAuthorized(self.state.user);
        return resJson;
       })



    

  }

  render() {
    var _this = this;
    return (

      <View style={styles.container}>
        <Image resizeMode='contain' source={require('image!mainLogo')} style={styles.logo}/>
        
         <FBLogin style={{ marginBottom: 10, }}
        permissions={["email","user_friends","public_profile"]}
        onLogin={function(data){
          console.log("Logged in!");
          console.log(data.credentials);
          _this.setState({ user : data.credentials },function(){
            _this.login();
          });
          
        }}
        onLogout={function(){
          console.log("Logged out.");
          _this.setState({ user : null });
        }}
        onLoginFound={function(data){
          console.log("Existing login found.");
          console.log(data);
           _this.setState({ user : data.credentials });
            

        }}
        onLoginNotFound={function(){
          console.log("No user logged in.");
          _this.setState({ user : null });
        }}
        onError={function(data){
          console.log("ERROR");
          console.log(data);
        }}
        onCancel={function(){
          console.log("User cancelled.");
        }}
        onPermissionsMissing={function(data){
          console.log("Check permissions!");
          console.log(data);
        }}
      />

      </View>
      
    );
  }

  
}


module.exports = LoginView;