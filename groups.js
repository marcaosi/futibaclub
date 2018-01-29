const express = require('express')
const app = express.Router()

const init = connection => {
    app.use((req, res, next) => {
        if(!req.session.user){
            res.redirect('/')
        }else{
            next()
        }
    })
    app.get('/', async(req, res) => {
        const [groups, fields] = await connection.execute('select groups.*, groups_users.role from groups left join groups_users on groups.id = groups_users.group_id and groups_users.user_id = ?', [
            req.session.user.id
        ])
        res.render('groups', {
            groups
        })
    })

    app.post('/', async(req, res) => {
        const [inserted, interstFields] = await connection.execute('insert into groups(name) values(?)',[
            req.body.name
        ])

        await connection.execute('insert into groups_users(user_id, group_id, role) values (?,?,?)', [
            req.session.user.id,
            inserted.insertId,
            'owner'
        ])

        res.redirect('/groups')
    })

    return app
}

module.exports = init