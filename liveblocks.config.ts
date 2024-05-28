import { LiveMap, createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

async function fetchUsersFromDB(userIds: string[]): Promise<{ id: string; name: string; avatar: { src: string } }[]> {
  try {
    // Make a request to your API or database to fetch user data for the provided userIds
    const response = await fetch(`/api/users?ids=${userIds.join(',')}`, {
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary authentication headers here
      },
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }

    // Parse the response data
    const data = await response.json();

    // Return the user data in the expected format
    return data.map((user) => ({
      id: user.id,
      name: user.name,
      avatar: {
        src: user.avatarUrl,
      },
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return an empty array or handle the error in a different way
    return [];
  }
}

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
  resolveUsers: async ({ userIds }) => {
    try {
      // Fetch user data from your data source (e.g., database or API)
      const usersData = await fetchUsersFromDB(userIds);

      // Map the fetched user data to the required format
      return userIds.map((userId) => {
        const userData = usersData.find((user) => user.id === userId);
        if (userData) {
          return {
            name: userData.name,
            avatar: userData.avatar.src,
          };
        }
        // If no user data is found, return a default user object
        return {
          name: `User ${userId}`,
          avatar: '/assets/favicon.ico',
        };
      });
    } catch (error) {
      console.error('Error resolving users:', error);
      // Return an array of default user objects with the same length as userIds
      return userIds.map((userId) => ({
        name: `User ${userId}`,
        avatar: '/assets/favicon.ico',
      }));
    }
  },
  resolveMentionSuggestions: async ({ text, roomId }) => {
    // Fetch all user IDs from your data source
    const userIds = await fetchAllUserIdsFromDB(roomId);

    // If no search text is provided, return all user IDs
    if (!text) {
      return userIds;
    }

    // Otherwise, filter user IDs based on the search text
    // and return an array with the same length as userIds
    return userIds.map((userId) =>
      userId.toLowerCase().includes(text.toLowerCase()) ? userId : null
    );
  },
});

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
type Presence = {
  // cursor: { x: number, y: number } | null,
  // ...
};

// Optionally, Storage represents the shared document that persists in the
// Room, even after all users leave. Fields under Storage typically are
// LiveList, LiveMap, LiveObject instances, for which updates are
// automatically persisted and synced to all connected clients.
type Storage = {
  canvasObjects: LiveMap<string, any>;
};

// Optionally, UserMeta represents static/readonly metadata on each user, as
// provided by your own custom auth back end (if used). Useful for data that
// will not change during a session, like a user's name or avatar.
type UserMeta = {
  // id?: string, // Accessible through `user.id`
  // info?: Json, // Accessible through `user.info`
};

// Optionally, the type of custom events broadcast and listened to in this
// room. Use a union for multiple events. Must be JSON-serializable.
type RoomEvent = {
  // type: "NOTIFICATION",
  // ...
};

// Optionally, when using Comments, ThreadMetadata represents metadata on
// each thread. Can only contain booleans, strings, and numbers.
export type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  time?: number;
  x: number;
  y: number;
};

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    useThreads,
    useUser,
    useCreateThread,
    useEditThreadMetadata,
    useCreateComment,
    useEditComment,
    useDeleteComment,
    useAddReaction,
    useRemoveReaction,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(client, {});