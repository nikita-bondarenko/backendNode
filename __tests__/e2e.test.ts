import req from 'supertest'
import { app, hash } from '../src/index'
import { wrongPasswordMessage, wrongEmailMessage, wrongNicknameMessage } from '../src/routes/auth'
import { wrongTagName } from '../src/routes/tag'
let tokens: any = null
let tokens2: any = null
let user = { password: 'asdQWE112341', email: `${Date.now()}example@mail.ru`, nickname: `${Date.now()}test` }
let user2 = { email: user.email + '1', nickname: user.nickname + '1', password: user.password }
let isExited = false
let isEntered = false
let isTokenUpdated = false
let isUserLocalyUpdated = false
let isTagsShown = false
let isTagsAddedToUser = false
let isTagShown = false
let isTagUpdated = false
let tag = { name: `${Date.now()}`, sortOrder: 2 }
let tag2: any = null
let tag3: any = null
let tagId: any = null
let tags: any = null

describe('POST /signup', () => {
    it("should response with status 400", async () => {
        await req(app).post('/signup').expect(400)
        await req(app).post('/signup').send({ ...user, password: '12345678' }).expect(400, wrongPasswordMessage)
        await req(app).post('/signup').send({ ...user, password: '12345678QWE' }).expect(400, wrongPasswordMessage)
        await req(app).post('/signup').send({ ...user, password: '12345678asd' }).expect(400, wrongPasswordMessage)
        await req(app).post('/signup').send({ ...user, password: 'asdQWE' }).expect(400, wrongPasswordMessage)
        await req(app).post('/signup').send({ ...user, email: 'asdQWE@' }).expect(400, wrongEmailMessage())
        await req(app).post('/signup').send({ ...user, email: 'asdQWE.' }).expect(400, wrongEmailMessage())
        await req(app).post('/signup').send({ ...user, nickname: `${Date.now()}${Date.now()}${Date.now()}` }).expect(400, wrongNicknameMessage())
    })
    it("should response with status 200 and return token", async () => {
        const { body } = await req(app).post('/signup').send(user).expect(200)
        tokens = body
    })
    it("should response with status 400", async () => {
        if (tokens) {
            await req(app).post('/signup').send(user).expect(400, wrongEmailMessage(user.email))
            await req(app).post('/signup').send({ ...user, email: user.email + 's' }).expect(400, wrongNicknameMessage(user.nickname))
        }
    })
})

describe("POST /logout", () => {
    it("should response with status 401", async () => {
        if (tokens) {
            await req(app).delete("/user").set('Authorization', `Refresh ${tokens.token}`).expect(401)
            await req(app).delete("/user").expect(401)
            await req(app).delete("/user").set('Authorization', `Bearer ${tokens.refreshToken}`).expect(401)
        }
    })
    it("should response with status 200 and return correct token", async () => {
        if (tokens) {
            const res = await req(app).post('/logout').set('Authorization', `Bearer ${tokens.token}`).expect(200)
            res ? isExited = true : 1
        }
    })
})

describe("POST /login", () => {
    it("should response with status 400", async () => {
        if (isExited) {
            await req(app).post('/login').expect(400)
            await req(app).post('/login').send({ ...user, password: user.password + '1' }).expect(400)
        }
    })
    it("should response with status 404", async () => {
        if (isExited) {

            await req(app).post('/login').send({ ...user, email: user.email + '1' }).expect(404)
        }

    })
    it("should response with status 200 and enter", async () => {
        if (isExited) {
            const { body } = await req(app).post('/login').send(user).expect(200)
            tokens = body
            body ? isEntered = true : 1
        }
    })
})

describe("POST /refresh", () => {
    it("should response with status 401", async () => {
        if (isEntered) {
            await req(app).post("/refresh").set('Authorization', `Refresh ${tokens.token}`).expect(401)
            await req(app).post("/refresh").expect(401)
            await req(app).post("/refresh").set('Authorization', `Bearer ${tokens.refreshToken}`).expect(401)
        }
    })

    it("should response with status 200 and update tokens", async () => {
        if (isEntered) {
            const { body } = await req(app).post('/refresh').set('Authorization', `Refresh ${tokens.refreshToken}`).expect(200)
            tokens = body
            body ? isTokenUpdated = true : 1
        }
    })
})

describe("GET /user", () => {
    it("should response with status 401", async () => {
        if (isTokenUpdated) {
            await req(app).get("/user").set('Authorization', `Refresh ${tokens.token}`).expect(401)
            await req(app).get("/user").expect(401)
            await req(app).get("/user").set('Authorization', `Bearer ${tokens.refreshToken}`).expect(401)
        }
    })
    it("should response with status 200 and returm current user's data", async () => {
        if (isTokenUpdated) {
            const { body } = await req(app).get("/user").set('Authorization', `Bearer ${tokens.token}`).expect(200)
            if (body) {
                expect(body.email).toEqual(user.email)
                expect(body.nickname).toEqual(user.nickname)
            }
        }
    })
})

describe("PUT /user", () => {
    it("should response with status 401", async () => {
        if (isUserLocalyUpdated) {
            await req(app).put("/user").set('Authorization', `Refresh ${tokens.token}`).send(user).expect(401)
            await req(app).put("/user").send(user).expect(401)
            await req(app).put("/user").set('Authorization', `Bearer ${tokens.refreshToken}`).send(user).expect(401)
        }
    })
    it("should response with status 400", async () => {
        if (isTokenUpdated) {
            await req(app).put('/user').set('Authorization', `Bearer ${tokens.token}`).expect(400)
            await req(app).put('/user').set('Authorization', `Bearer ${tokens.token}`).send({ password: '12345678' }).expect(400, wrongPasswordMessage)
            await req(app).put('/user').set('Authorization', `Bearer ${tokens.token}`).send({ password: '12345678QWE' }).expect(400, wrongPasswordMessage)
            await req(app).put('/user').set('Authorization', `Bearer ${tokens.token}`).send({ password: '12345678asd' }).expect(400, wrongPasswordMessage)
            await req(app).put('/user').set('Authorization', `Bearer ${tokens.token}`).send({ password: 'asdQWE' }).expect(400, wrongPasswordMessage)
            await req(app).put('/user').set('Authorization', `Bearer ${tokens.token}`).send({ email: 'asdQWE@' }).expect(400, wrongEmailMessage())
            await req(app).put('/user').set('Authorization', `Bearer ${tokens.token}`).send({ email: 'asdQWE.' }).expect(400, wrongEmailMessage())
            await req(app).put('/user').set('Authorization', `Bearer ${tokens.token}`).send({ nickname: `${hash(String(Date.now()))}` }).expect(400, wrongNicknameMessage())
        }
    })

    it("should response with status 200 and return current user's data", async () => {
        if (isTokenUpdated) {
            user = { password: 'asdQWE112341', email: `${Date.now()}example@mail.ru`, nickname: `${Date.now()}test` }
            const { body } = await req(app).put('/user').set('Authorization', `Bearer ${tokens.token}`).send(user).expect(200, { email: user.email, nickname: user.nickname })
            if (body) isUserLocalyUpdated = true
        }
    })
    it("should response with status 409", async () => {
        if (isUserLocalyUpdated) {
            const { body } = await req(app).post("/signup").send(user2).expect(200)
            tokens2 = body
            await req(app).put('/user').set('Authorization', `Bearer ${tokens.token}`).send({ nickname: user2.nickname }).expect(409)
            await req(app).put('/user').set('Authorization', `Bearer ${tokens.token}`).send({ email: user2.email }).expect(409)
        }
    })
})

describe("POST /tag", () => {
    it("should response with status 401", async () => {
        if (isTokenUpdated) {

            await req(app).post("/tag").set('Authorization', `Refresh ${tokens.token}`).send(tag).expect(401)
            await req(app).post("/tag").send(tag).expect(401)
            await req(app).post("/tag").set('Authorization', `Bearer ${tokens.refreshToken}`).send(tag).expect(401)
        }
    })
    it("should response with status 200", async () => {
        if (isTokenUpdated) {

            const { body } = await req(app).post("/tag").set('Authorization', `Bearer ${tokens.token}`).send(tag).expect(200)
            expect(body.name).toEqual(tag.name)
            expect(body.sortOrder).toEqual(tag.sortOrder)
            tagId = body.id
            tag = body
        }

        if (tokens2) {

            const { body } = await req(app).post('/tag').set('Authorization', `Bearer ${tokens2.token}`).send({ name: tag.name + '2' }).expect(200)
            body ? tag2 = body : 1
        }
        if (tokens2) {
            const { body } = await req(app).post('/tag').set('Authorization', `Bearer ${tokens2.token}`).send({ name: tag.name + '3' }).expect(200)
            body ? tag3 = body : 1
        }


    })
    it("should response with status 400", async () => {
        if (isTokenUpdated) {
            await req(app).post("/tag").set('Authorization', `Bearer ${tokens.token}`).expect(400)
            await req(app).post("/tag").set('Authorization', `Bearer ${tokens.token}`).send({ name: `${hash(String(Date.now()))}` }).expect(400, wrongTagName())

            if (tagId) {
                await req(app).post("/tag").set('Authorization', `Bearer ${tokens.token}`).send(tag).expect(400, wrongTagName(tag.name))
            }
        }

    })
})

describe("GET /tag/:id", () => {
    it("should response with status 401", async () => {
        if (tagId) {
            await req(app).get(`/tag/${tagId}`).set('Authorization', `Refresh ${tokens.token}`).expect(401)
            await req(app).get(`/tag/${tagId}`).expect(401)
            await req(app).get(`/tag/${tagId}`).set('Authorization', `Bearer ${tokens.refreshToken}`).expect(401)
        }
    })
    it("should response with status 404", async () => {

        if (tagId) {
            await req(app).get(`/tag/${Date.now()}`).set('Authorization', `Bearer ${tokens.token}`).expect(404)

        }
    })
    it("should response with status 200", async () => {

        if (tagId) {
            const { body } = await req(app).get(`/tag/${tagId}`).set('Authorization', `Bearer ${tokens.token}`).expect(200)
            expect(body.name).toEqual(tag.name)
            expect(body.sortOrder).toEqual(tag.sortOrder)
            expect(body.creator.nickname).toEqual(user.nickname)
            if (body) isTagShown = true

        }
    })
})
const name = String(Date.now())
const sortOrder = 3
describe("PUT /tag/:id", () => {
    it("should response with status 401", async () => {
        if (tagId) {
            await req(app).get(`/tag/${tagId}`).set('Authorization', `Refresh ${tokens.token}`).send({ name, sortOrder }).expect(401)
            await req(app).get(`/tag/${tagId}`).send({ name, sortOrder }).expect(401)
            await req(app).get(`/tag/${tagId}`).set('Authorization', `Bearer ${tokens.refreshToken}`).send({ name, sortOrder }).expect(401)
        }
    })
    it("should response with status 403 and create new tags", async () => {

        if (tagId && tokens2) {
            await req(app).put(`/tag/${tagId}`).set('Authorization', `Bearer ${tokens2.token}`).send({ name, sortOrder }).expect(403)
        }
    })
    it("should response with status 400", async () => {

        if (tagId) {
            await req(app).put(`/tag/${tagId}`).set('Authorization', `Bearer ${tokens.token}`).expect(400)
        }
    })
    it("should response with status 404", async () => {

        if (tagId) {
            await req(app).put(`/tag/${Date.now()}`).set('Authorization', `Bearer ${tokens.token}`).send({ name, sortOrder }).expect(404)
        }
    })
    it("should response with status 200", async () => {

        if (tagId) {
            const { body } = await req(app).put(`/tag/${tagId}`).set('Authorization', `Bearer ${tokens.token}`).send({ name, sortOrder }).expect(200)
            expect(body.name).toEqual(name)
            expect(body.sortOrder).toEqual(sortOrder)
            if (body) isTagUpdated = true
        }
    })
})

describe("GET /tag", () => {
    it("should response with status 401", async () => {
        if (isTagUpdated) {
            await req(app).get(`/tag/`).set('Authorization', `Refresh ${tokens.token}`).expect(401)
            await req(app).get(`/tag/`).expect(401)
            await req(app).get(`/tag/`).set('Authorization', `Bearer ${tokens.refreshToken}`).expect(401)
        }
    })
    it("should response with status 200 and log result", async () => {

        if (isTagUpdated) {
            const { body } = await req(app).get('/tag').set('Authorization', `Bearer ${tokens.token}`).expect(200)
            console.log("GET /tag", JSON.stringify(body))
        }
        if (isTagUpdated) {
            const { body } = await req(app).get('/tag').set('Authorization', `Bearer ${tokens.token}`).query({ sortByOrder: '', page: 1, pageSize: 2 }).expect(200)
            console.log("GET /tag", JSON.stringify(body))
        }
        if (isTagUpdated) {
            const { body } = await req(app).get('/tag').set('Authorization', `Bearer ${tokens.token}`).query({ sortByName: '', pageSize: 2 }).expect(200)
            console.log("GET /tag", JSON.stringify(body))
        }
        if (isTagUpdated) {
            const { body } = await req(app).get('/tag').set('Authorization', `Bearer ${tokens.token}`).query({ sortByName: '', sortByOrder: '', page: 4, pageSize: 4 }).expect(200)
            console.log("GET /tag", JSON.stringify(body))
        }

    })
})

describe("DELETE /tag/:id", () => {
    it("should response with status 400", async () => {
        if (isTagUpdated) {
            await req(app).delete('/tag/bad-id').set('Authorization', `Bearer ${tokens.token}`).expect(400)
        }
    })

    it("should response with status 401", async () => {
        if (isTagUpdated) {
            await req(app).delete(`/tag/${tagId}`).set('Authorization', `Refresh ${tokens.token}`).expect(401)
            await req(app).delete(`/tag/${tagId}`).expect(401)
            await req(app).delete(`/tag/${tagId}`).set('Authorization', `Bearer ${tokens.refreshToken}`).expect(401)
        }
    })
    it("should response with status 403", async () => {
        if (isTagUpdated && tokens2) {
            await req(app).delete(`/tag/${tagId}`).set('Authorization', `Bearer ${tokens2.token}`).expect(403)
        }
    })
    it("should response with status 404", async () => {
        if (isTagUpdated && tokens2) {
            await req(app).delete(`/tag/${Date.now()}`).set('Authorization', `Bearer ${tokens2.token}`).expect(404)
        }
    })

    it("should response with status 204", async () => {
        if (isTagUpdated) {
            await req(app).delete(`/tag/${tagId}`).set('Authorization', `Bearer ${tokens.token}`).expect(204)
        }
    })
})

describe("POST /user/tag", () => {
    it("should response with status 401", async () => {
        if (tag2 && tag3) {
            await req(app).post("/user/tag").send({ tags: [tag2.id, tag3.id] }).set('Authorization', `Refresh ${tokens.token}`).expect(401)
            await req(app).post("/user/tag").send({ tags: [tag2.id, tag3.id] }).expect(401)
            await req(app).post("/user/tag").send({ tags: [tag2.id, tag3.id] }).set('Authorization', `Bearer ${tokens.refreshToken}`).expect(401)
        }
    })
    it("should response with status 404", async () => {
        if (tag2 && tag3) {
            await req(app).post('/user/tag').set('Authorization', `Bearer ${tokens.token}`).send({ tags: [tag2.id, Date.now() + 1] }).expect(404)
        }

    })
    it("should response with status 200 and log", async () => {
        if (tag2 && tag3) {
            const { body } = await req(app).post('/user/tag').set('Authorization', `Bearer ${tokens.token}`).send({ tags: [tag2.id, tag3.id] }).expect(200)
            tags = body.tags
            if (body) isTagsAddedToUser = true
        }
    })
})

describe("GET /user/tag/my", () => {
    it("should response with status 401", async () => {
        if (isTagsAddedToUser) {
            await req(app).get('/user/tag/my').set('Authorization', `Refresh ${tokens.token}`).expect(401)
            await req(app).get('/user/tag/my').expect(401)
            await req(app).get('/user/tag/my').set('Authorization', `Bearer ${tokens.refreshToken}`).expect(401)
        }
    })
    it("should response with status 200 and return current tags", async () => {
        if (isTagsAddedToUser) {
            const { body } = await req(app).get('/user/tag/my').set('Authorization', `Bearer ${tokens.token}`).expect(200, { tags })
            if (body) isTagsShown = true
        }
    })
})

describe("DELETE /user/tag/:id", () => {
    it("should response with status 400", async () => {
        if (isTagsShown) {
            await req(app).delete(`/user/tag/bad-id`).set('Authorization', `Bearer ${tokens.token}`).expect(400)

        }
    })
    it("should response with status 401", async () => {
        if (isTagsShown) {
            await req(app).delete(`/user/tag/${tag2.id}`).set('Authorization', `Refresh ${tokens.token}`).expect(401)
            await req(app).delete(`/user/tag/${tag2.id}`).expect(401)
            await req(app).delete(`/user/tag/${tag2.id}`).set('Authorization', `Bearer ${tokens.refreshToken}`).expect(401)
        }
    })
    it("should response with status 403", async () => {
        if (isTagsShown) {
            await req(app).delete(`/user/tag/${tag2.id}`).set('Authorization', `Bearer ${tokens2.token}`).expect(403)
        }
    })
    it("should response with status 404", async () => {
        if (isTagsShown) {
            await req(app).delete(`/user/tag/${Date.now() + 100}`).set('Authorization', `Bearer ${tokens.token}`).expect(404)
        }
    })
    it("should response with status 204", async () => {

        if (isTagsShown) {
            await req(app).delete(`/user/tag/${tag2.id}`).set('Authorization', `Bearer ${tokens.token}`).expect(204)
        }
    })
})

describe("DELETE /user", () => {
    it("should response with status 401", async () => {
        if (tokens) {
            await req(app).delete("/user").set('Authorization', `Refresh ${tokens.token}`).expect(401)
            await req(app).delete("/user").expect(401)
            await req(app).delete("/user").set('Authorization', `Bearer ${tokens.refreshToken}`).expect(401)
        }
    })
    it("should response with status 204", async () => {
        if (tokens && tokens2) {
            await req(app).delete("/user").set('Authorization', `Bearer ${tokens.token}`).expect(204)
            await req(app).delete("/user").set('Authorization', `Bearer ${tokens2.token}`).expect(204)
        }
    })

})