import { cleanupRoutine } from './services/cleanupservice'
import { server } from './util/server'

const PORT : number = 3000
const CLEANUP_INTERVAL = Number(process.env.CLEANUP_INTERVAL) | 1000*60*5

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    setInterval(cleanupRoutine, CLEANUP_INTERVAL)
})



