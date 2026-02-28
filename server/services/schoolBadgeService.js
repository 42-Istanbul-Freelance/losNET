const School = require('../models/School');

const BADGE_CRITERIA = {
    inci_dostu: 100,   // Toplam 100+ saat
    etki_lideri: 500,  // Toplam 500+ saat
    yilin_okulu: null  // En yüksek saatli okul (sadece 1 okul)
};

async function calculateSchoolBadge(school) {
    const totalHours = school.totalHours || 0;
    if (totalHours >= BADGE_CRITERIA.etki_lideri) return 'etki_lideri';
    if (totalHours >= BADGE_CRITERIA.inci_dostu) return 'inci_dostu';
    return 'none';
}

async function updateSchoolBadges() {
    const schools = await School.find().sort({ totalHours: -1 });
    const topSchoolId = schools[0]?._id;

    for (const school of schools) {
        let badge = 'none';
        if (school.totalHours >= BADGE_CRITERIA.inci_dostu) {
            if (school._id.equals(topSchoolId) && school.totalHours > 0) {
                badge = 'yilin_okulu';
            } else if (school.totalHours >= BADGE_CRITERIA.etki_lideri) {
                badge = 'etki_lideri';
            } else {
                badge = 'inci_dostu';
            }
        }
        if (school.badge !== badge) {
            school.badge = badge;
            await school.save();
        }
    }
}

async function updateSchoolBadgeAfterActivity(schoolId) {
    const school = await School.findById(schoolId);
    if (!school) return;
    await updateSchoolBadges();
}

module.exports = { updateSchoolBadges, updateSchoolBadgeAfterActivity, BADGE_CRITERIA };
