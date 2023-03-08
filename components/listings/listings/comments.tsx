import {
  Button,
  Flex,
  HStack,
  Image,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { GoCommentDiscussion } from 'react-icons/go';
import { createComment } from '../../../utils/functions';
import { genrateuuid } from '../../../utils/helpers';

interface Props {
  onOpen: () => void;
  refId: string;
}
export const Comments = ({ onOpen, refId }: Props) => {
  const [message, setMessage] = useState<string>('');
  const commentMutation = useMutation({
    mutationFn: createComment,
    onError: () => {
      toast.success('Error occur while commenting');
    },
    onSuccess: () => {
      toast.success('commented');
    },
  });
  return (
    <>
      <VStack
        rounded={'xl'}
        gap={3}
        w={'full'}
        align={'start'}
        bg={'#FFFFFF'}
        pb={5}
      >
        <HStack px={6} pt={4} w={'full'}>
          <GoCommentDiscussion fontWeight={600} fontSize={'1.5rem'} />
          <HStack>
            <Text fontWeight={600} color={'#64758B'} fontSize={'1.1rem'}>
              233
            </Text>
            <Text fontWeight={400} color={'#64758B'} fontSize={'1.1rem'}>
              Comments
            </Text>
          </HStack>
        </HStack>
        <VStack px={6} w={'full'}>
          <Textarea
            h={32}
            border={'1px solid #E2E8EF'}
            placeholder="Write a comment..."
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          ></Textarea>
          <Flex w="full" justify={'end'}>
            <Button
              onClick={() => {
                commentMutation.mutate({
                  id: genrateuuid(),
                  message: message,
                  refId: refId,
                  talentId: '',
                  timeStamp: JSON.stringify(Date.now()),
                });
              }}
              bg={'#6562FF'}
              color={'white'}
              fontSize={'1rem'}
            >
              Comment
            </Button>
          </Flex>
        </VStack>
        <HStack align={'start'} px={6}>
          <Image src={'/assets/randompeople/nft5.svg'} alt={'profile image'} />
          <VStack align={'start'}>
            <HStack>
              <Text color={'#1E293B'} fontWeight={600}>
                James Mckey
              </Text>
              <Text color={'#94A3B8'} fontWeight={500}>
                7:38 PM
              </Text>
            </HStack>
            <Text mt={'0px !important'}>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem
              ipsum dolor, sit amet consectetur adipisicing elit. Culpa maiores
              reprehenderit mollitia iusto fugiat vero tempora necessitatibus
              expedita facere velit? Obcaecati adipisci accusamus nihil labore
              ducimus. Iure, pariatur. Placeat repellendus mollitia error non
              numquam. Consequuntur reiciendis veritatis dolore aut deserunt
              quis unde impedit omnis eum ducimus repellat eius, necessitatibus
              quasi accusantium veniam nemo dolorem molestiae, id et officia
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </>
  );
};
