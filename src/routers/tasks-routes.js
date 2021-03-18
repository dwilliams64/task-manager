const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/tasks');

const router = new express.Router();

// Task routes
router.post('/tasks', auth, async (req, res) => {
    const {user: {_id}, body} = req;
    console.log(_id, body)
    
    try {        
        const task = new Task({
            ...body,
            owner: _id
        });
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(`Error ${e}`);
    }
});

router.get('/tasks', auth, async (req, res) => {
    const {user} = req;
    console.log(user)

    try {
        await user.populate('tasks').execPopulate();
        res.send(user.tasks);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    const {params: {id: _id}, user: {_id: owner}} = req;

    try {
        const task = await Task.findOne({_id, owner});
        if (!task) return res.status(404).send();
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const {params: {id: _id}, body, user: {_id: owner}} = req;
    const updates = Object.keys(body);
    const allowedUpdate = ["description", "completed"];

    const isValidUpdate = updates.every((update) => allowedUpdate.includes(update));

    if (!isValidUpdate) return res.status(404).send({error: 'Invalid update parameters.'});

    try {
        // const taskUpdate = await Task.findByIdAndUpdate(_id, body, {new: true, runValidators: true});

        const task = await Task.findOne({_id, owner});        
        
        if (!task) return res.status(404).send({error: 'Task cannot be found.'});

        updates.forEach((update) => task[update] = body[update]);

        await task.save();

        res.status(202).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    const {params: {id: _id}, user: {_id: owner}} = req;

    try {
        const taskDelete = await Task.findOneAndDelete({_id, owner});
        console.log(taskDelete)

        if (!taskDelete) return res.status(404).send({error: 'task cannot be found'});

        res.status(202).send(taskDelete);
    } catch (e) {
        res.status(500).send();
    }

});

module.exports = router;