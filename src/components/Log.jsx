const Log = ({ messages }) => {
    return (
        <div>
            {messages.map((item) => {
                return <p>{item}</p>
            })}
        </div>
    )
}
export default Log