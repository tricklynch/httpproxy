import express from 'express'
import { join } from 'path'

import { destroyProxy, makeProxy } from './http_proxy'

const app = express()

app.use('/', express.static(join(__dirname, '..', 'public')))

app.post('/proxy', (req, res) => {
    makeProxy()
    res.send('Done')
})

app.delete('/proxy', (req, res) => {
    destroyProxy()
    res.send('Deleted')
})

app.listen(5000, () => console.log('listening'))