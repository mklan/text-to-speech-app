import fetchJsonp from 'fetch-jsonp';

type fetchPostsParams = {
  subreddit: string;
  limit: number;
  filter: string;
  after?: string;
  time: 'all' | 'month' | 'week' | 'day' | 'hour';
};

type Post = {
  data: {
    selftext: string;
    subreddit: string;
    author_fullname: string;
    gilded: number;
  };
};

export async function fetchPosts(params: fetchPostsParams): Promise<Post[]> {
  const response = await jsonpApi(
    `r/${params.subreddit}/${params.filter}`,
    `after=${params.after}&t=${params.time}&limit=${params.time}`,
  );
  const { data } = await response.json();
  return data.children;
}

async function jsonpApi(post: string, params = '') {
  return fetchJsonp(`https://www.reddit.com/${post}/.json?jsonp=?&${params}`, {
    jsonpCallback: 'jsonp',
    nonce: '',
    referrerPolicy: '',
  });
}
