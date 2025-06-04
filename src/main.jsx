import { render } from 'preact'
import './index.css'
import { App } from './app.jsx'
import 'antd/dist/reset.css' // nếu dùng Ant Design 5+


render(<App />, document.getElementById('app'))
