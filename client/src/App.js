import { Route, Switch } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
import UserForm from './components/UserForm';


export default function App(props) {
  return (
    <main>
      <Switch>
        <Route path="/" exact component={Home}/>
        <Route path="/login" exact component={Login}/>
        <Route path="/form" exact component={UserForm}/>
      </Switch>
    </main>
  )
}
