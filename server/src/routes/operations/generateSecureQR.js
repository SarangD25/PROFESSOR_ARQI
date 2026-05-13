import { createAction } from '../../middleware/operations.js'
import generateSecureQR from '../../actions/generateSecureQR.js'

export default createAction(generateSecureQR)
