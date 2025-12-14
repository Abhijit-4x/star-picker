const express = require("express");
const router = express.Router();
const Audit = require("../models/Audit");
const Star = require("../models/Star");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  validationError,
  validationErrorSingle,
} = require("../utils/errorResponses");

// Submit new or existing star for audit
router.post("/audit", requireAuth, async (req, res) => {
  const { auditType, starName, tier, starId, comment } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!auditType || !starName || !tier) {
    return res
      .status(400)
      .json(
        validationErrorSingle("auditType, starName, and tier are required.")
      );
  }

  // Validate auditType
  if (!["create", "update", "delete"].includes(auditType)) {
    return res
      .status(400)
      .json(
        validationErrorSingle(
          "auditType must be one of: create, update, delete"
        )
      );
  }

  // Validate tier
  if (tier < 1 || tier > 5) {
    return res
      .status(400)
      .json(validationErrorSingle("tier must be between 1 and 5"));
  }

  // For update and delete, starId is required
  if ((auditType === "update" || auditType === "delete") && !starId) {
    return res
      .status(400)
      .json(
        validationErrorSingle(`starId is required for ${auditType} audit type`)
      );
  }

  // For create, starId should be null
  if (auditType === "create" && starId) {
    return res
      .status(400)
      .json(
        validationErrorSingle(
          "starId should not be provided for create audit type"
        )
      );
  }

  try {
    const newAudit = new Audit({
      auditType,
      starName,
      tier,
      starId: starId || null,
      comment: comment || "",
      createdBy: userId,
    });

    await newAudit.save();
    res.status(201).json({
      message: "Audit submitted successfully",
      audit: newAudit,
    });
  } catch (err) {
    console.error("Error submitting audit:", err);
    res.status(500).json({ error: "Failed to submit audit" });
  }
});

// Get all audits (all authenticated users can view, admins can act)
router.get("/audit", requireAuth, async (req, res) => {
  try {
    const audits = await Audit.find()
      .populate("createdBy", "username email")
      .populate("starId")
      .sort({ createdAt: -1 });

    res.json(audits);
  } catch (err) {
    console.error("Error fetching audits:", err);
    res.status(500).json({ error: "Failed to fetch audits" });
  }
});

// Approve an audit (admin only)
router.put("/audit/:id/approve", requireAuth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Only admins can approve audits",
    });
  }

  const { id } = req.params;
  const { comment } = req.body;

  try {
    const audit = await Audit.findById(id);

    if (!audit) {
      return res.status(404).json({ error: "Audit not found" });
    }

    if (audit.status !== "pending") {
      return res
        .status(400)
        .json(validationErrorSingle(`Audit is already ${audit.status}`));
    }

    // Handle approval based on auditType
    if (audit.auditType === "create") {
      // Create new star
      const newStar = new Star({
        starName: audit.starName,
        tier: audit.tier,
      });

      try {
        await newStar.save();
      } catch (err) {
        if (err.code === 11000 && err.keyValue && err.keyValue.starName) {
          return res.status(409).json({
            error: `Star with name '${audit.starName}' already exists`,
          });
        }
        throw err;
      }
    } else if (audit.auditType === "update") {
      // Update existing star
      const existingStar = await Star.findById(audit.starId);

      if (!existingStar) {
        return res.status(404).json({ error: "Star not found" });
      }

      try {
        await Star.findByIdAndUpdate(
          audit.starId,
          {
            starName: audit.starName,
            tier: audit.tier,
            updatedAt: new Date(),
          },
          { new: true, runValidators: true }
        );
      } catch (err) {
        if (err.code === 11000 && err.keyValue && err.keyValue.starName) {
          return res.status(409).json({
            error: `Star with name '${audit.starName}' already exists`,
          });
        }
        throw err;
      }
    } else if (audit.auditType === "delete") {
      // Delete existing star
      const existingStar = await Star.findById(audit.starId);

      if (!existingStar) {
        return res.status(404).json({ error: "Star not found" });
      }

      await Star.findByIdAndDelete(audit.starId);
    }

    // Update audit status to approved
    audit.status = "approved";
    if (comment) {
      audit.comment = comment;
    }
    audit.updatedAt = new Date();
    await audit.save();

    res.json({
      message: "Audit approved successfully",
      audit,
    });
  } catch (err) {
    console.error("Error approving audit:", err);
    res.status(500).json({ error: "Failed to approve audit" });
  }
});

// Reject an audit (admin only)
router.put("/audit/:id/reject", requireAuth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Only admins can reject audits",
    });
  }

  const { id } = req.params;
  const { comment } = req.body;

  try {
    const audit = await Audit.findById(id);

    if (!audit) {
      return res.status(404).json({ error: "Audit not found" });
    }

    if (audit.status !== "pending") {
      return res
        .status(400)
        .json(validationErrorSingle(`Audit is already ${audit.status}`));
    }

    // Update audit status to rejected
    audit.status = "rejected";
    if (comment) {
      audit.comment = comment;
    }
    audit.updatedAt = new Date();
    await audit.save();

    res.json({
      message: "Audit rejected successfully",
      audit,
    });
  } catch (err) {
    console.error("Error rejecting audit:", err);
    res.status(500).json({ error: "Failed to reject audit" });
  }
});

module.exports = router;
