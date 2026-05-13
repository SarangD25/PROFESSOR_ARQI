import { createQuery } from '../../middleware/operations.js'
import getStudentPapers from '../../queries/getStudentPapers.js'

export default createQuery(getStudentPapers)
