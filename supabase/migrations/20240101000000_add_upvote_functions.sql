-- Create the article_votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS article_votes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, article_id)
);

-- Enable RLS
ALTER TABLE article_votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own votes"
    ON article_votes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own votes"
    ON article_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
    ON article_votes FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to increment upvotes
CREATE OR REPLACE FUNCTION increment_upvotes(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE articles
    SET upvotes = COALESCE(upvotes, 0) + 1
    WHERE id = article_id;
END;
$$;

-- Create function to decrement upvotes
CREATE OR REPLACE FUNCTION decrement_upvotes(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE articles
    SET upvotes = GREATEST(COALESCE(upvotes, 0) - 1, 0)
    WHERE id = article_id;
END;
$$;
