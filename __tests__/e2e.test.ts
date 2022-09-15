import req from 'supertest'
import { app } from '../src/index'
import { wrongPasswordMessage, wrongEmailMessage, wrongNicknameMessage } from '../src/routes/auth'

let tokens: any = null
let newTokens: any = null
let user = { password: 'asdQWE112341', email: `${Date.now()}example@mail.ru`, nickname: `${Date.now()}test` }
let isExited = false
let isEntered = false
let isTokenUpdated = false

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
    it("should response with status 400", async () => {
        if (tokens) {
            await req(app).delete("/user").set('Authorization', `Refresh ${tokens.token}`).expect(400)
            await req(app).delete("/user").expect(400)
            await req(app).delete("/user").set('Authorization', `Bearer ${tokens.refreshToken}`).expect(400)
        }
    })
    it("should response with status 200 and return correct token", async () => {
        if (tokens) {
            const res = await req(app).post('/logout').set('Authorization', `Bearer ${tokens.token}`)
            res ? isExited = true : 1
        }
    })
})

describe("POST /login", () => {
    it("should response with status 400", async () => {
        if (isExited) {
            await req(app).post('/login').expect(400)
            await req(app).post('/login').send({ ...user, email: user.email + '1' }).expect(400)
            await req(app).post('/login').send({ ...user, nickname: user.nickname + '1' }).expect(400)
            await req(app).post('/login').send({ ...user, password: user.password + '1' }).expect(400)
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
    it("should response with status 400", async () => {
        if (isExited) {
            await req(app).post("/refresh").set('Authorization', `Refresh ${tokens.token}`).expect(400)
            await req(app).post("/refresh").expect(400)
            await req(app).post("/refresh").set('Authorization', `Bearer ${tokens.refreshToken}`).expect(400)
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
    it("should response with status 400", async () => {
        if (isTokenUpdated) {
            await req(app).delete("/user").set('Authorization', `Refresh ${tokens.token}`).expect(400)
            await req(app).delete("/user").expect(400)
            await req(app).delete("/user").set('Authorization', `Bearer ${tokens.refreshToken}`).expect(400)
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

//PUT

//tags

describe("DELETE /user", () => {
    it("should response with status 400", async () => {
        if (tokens) {
            await req(app).delete("/user").set('Authorization', `Refresh ${tokens.token}`).expect(400)
            await req(app).delete("/user").expect(400)
            await req(app).delete("/user").set('Authorization', `Bearer ${tokens.refreshToken}`).expect(400)
        }
    })
    it("should response with status 204", async () => {
        if (tokens) {
            await req(app).delete("/user").set('Authorization', `Bearer ${tokens.token}`).expect(204)
        }
    })

})