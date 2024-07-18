const ensureUniqueIds = (posts1, posts2) => {
    // Create a set to track seen _id values
    const seenIds = new Set();

    // Iterate through posts1 to collect unique _id values
    posts1.forEach(post => seenIds.add(post._id.toString()));

    // Filter posts2 to exclude posts with duplicate _id values
    const uniquePosts2 = posts2.filter(post => !seenIds.has(post._id.toString()));

    return uniquePosts2;
};

module.exports = ensureUniqueIds