import express from "express"
const router = express.Router()
import CreaController from "../controller/CreaController.js"

router.get("/colleges", CreaController.getAllCollege)
router.get("/course/:id", CreaController.getCourseByCollegeId)
router.get("/subject/:id", CreaController.getSubjectsByCourseId)
router.get("/classes/:courseId", CreaController.getClassByCourseId);
router.get("/students/:id", CreaController.getStudentsByClassId);

export default router