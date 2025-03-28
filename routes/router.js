import { Router } from "express";
import authRouter from "./auth.routes.js";
import baseRouter from "./base.routes.js";
import userRouter from "./user.routes.js";
import courseRouter from "./course.routes.js";
import courseReferenceRouter from "./courseReference.routes.js";
import courseModuleRouter from "./courseModule.routes.js";
import lectureRouter from "./lecture.routes.js";
import lectureContentRouter from "./lectureContent.routes.js";
import lectureReferenceRouter from "./lectureReference.routes.js";
import lectureMCQsRouter from "./lectureMCQs.routes.js";
import lectureAssignmentRouter from "./lectureAssignment.routes.js";
import lectureAssignmentInstructionRouter from "./lectureAssignmentInstruction.routes.js";
import lectureAssignmentSACLQsRouter from "./lectureAssignmentSACLQs.routes.js";
import lectureAssignmentSubmissionRouter from "./lectureAssignmentSubmission.routes.js";
import sessionRouter from "./session.routes.js";
import articleRouter from "./article.routes.js";
import articleContentRouter from "./articleContent.routes.js";
import scriptRouter from "./script.routes.js";
import interviewRouter from "./interview.routes.js";
import healthModuleRouter from "./healthModule.routes.js";

const router = Router({ mergeParams: true });

router.use("/auth", authRouter);
router.use("/base", baseRouter);
router.use("/user", userRouter);

router.use("/course", courseRouter);
router.use("/course-reference", courseReferenceRouter);
router.use("/course-module", courseModuleRouter);

router.use("/lecture", lectureRouter);
router.use("/lecture-content", lectureContentRouter);
router.use("/lecture-reference", lectureReferenceRouter);
router.use("/lecture-mcq", lectureMCQsRouter);
router.use("/lecture-assignment", lectureAssignmentRouter);
router.use(
  "/lecture-assignment/instruction",
  lectureAssignmentInstructionRouter,
);
router.use(
  "/lecture-assignment/self-assessment-checklist-question",
  lectureAssignmentSACLQsRouter,
);
router.use("/lecture-assignment/submission", lectureAssignmentSubmissionRouter);

router.use("/session", sessionRouter);

router.use("/article", articleRouter);
router.use("/article-content", articleContentRouter);
router.use("/script", scriptRouter);
router.use("/interview", interviewRouter);
router.use("/health-module", healthModuleRouter);

export default router;
