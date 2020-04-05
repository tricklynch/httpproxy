import express from 'express'

import { destroyProxy, makeProxy } from './http_proxy'

const app = express()

app.get('/', (req, res) => {
    res.send('Hello')
})

app.post('/proxy', (req, res) => {
    makeProxy()
    res.send('Done')
})

app.delete('/proxy', (req, res) => {
    destroyProxy()
    res.send('Deleted')
})

app.listen(5000, () => console.log('listening'))