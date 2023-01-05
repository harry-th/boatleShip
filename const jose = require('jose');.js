let otherStuff = () => {
    console.log('wow')
    let a = 1
    const jose = require('jose');
    let doIt = async () => {
        const secret = new TextEncoder().encode(
            'bimbdab',
        )
        console.log({ secret })
        console.log()

        const jwt = await new jose.SignJWT({ 'hello': true })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret)

        console.log(jwt)
        const { payload } = await jose.jwtVerify(jwt, secret)

        // console.log(protectedHeader)
        console.log(payload)
    }
    doIt()
    console.log(a + 2)
}
otherStuff()