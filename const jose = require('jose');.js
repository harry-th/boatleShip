let otherStuff = () => {
    console.log('wow')
    let a = 1
    const jose = require('jose');
    let doIt = async () => {
        const secret = new TextEncoder().encode(
            process.env.SECRET_ACCESS_TOKEN,
        )
        console.log(process.env.REACT_APP_secret_access_code)

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