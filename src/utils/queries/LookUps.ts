export const categoryLookUp = {
  $lookup: {
    from: 'categories',
    as: 'category',
    let: {
      category: '$categoryId',
    },
    pipeline: [
      {
        $match: {
          $expr: {
            $eq: ['$_id', '$$category'],
          },
        },
      },
      {
        $project: {
          name: 1,
          _id: 1,
          slug: 1,
        },
      },
      {
        $limit: 1,
      },
    ],
  },
};

export const departmentLookUp = {
  $lookup: {
    from: 'departments',
    as: 'department',
    let: {
      department: '$departmentId',
    },
    pipeline: [
      {
        $match: {
          $expr: {
            $eq: ['$_id', '$$department'],
          },
        },
      },
      {
        $project: {
          name: 1,
          _id: 1,
          slug: 1,
        },
      },
      {
        $limit: 1,
      },
    ],
  },
};
